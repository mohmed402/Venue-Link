const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const multer = require("multer");
const upload = multer(); // or multer({ storage: ... }) if needed

router.post("/venueInfo", async (req, res) => {
  const { data: formData, userId, ids } = req.body;
  const { info } = formData;
  // const { idsData } = ids;
  const {
    cateringId,
    menuId,
    venueTypeId,
    facilitiesId,
    allowedEventId,
    parkingId,
    locationId,
  } = ids;

  const venueType_id = venueTypeId.venueType_id;
  const catering_id = cateringId.catering_id;
  const menu_id = menuId.menu_id || venueType_id;
  const facilities_id = facilitiesId.facilities_id;
  const allowedEvents_id = allowedEventId.allowedEvents_id;
  const parking_id = parkingId.parking_id;
  const location_id = locationId.location_id;

  if (!formData || !userId) {
    return res.status(400).json({ error: "Missing data or userId" });
  }
  const email = formData["type-0"];
  const venueType = formData["type-1"];
  const placeType = formData["type-2"];
  const country = formData.country;
  const city = formData.city;
  const { address, lat, lng } = formData.location[0];

  const venueTitle = info.venueTitle;
  const venueName = info.venueName;
  const venuePrice = info.venuePrice;
  const venueCapacity = info.venueCapacity;
  const about = info.about;

  try {
    // First insert the venue data
    const { data: venueData, error: venueError } = await supabase
      .from("venues")
      .insert([
        {
          user_id: userId,
          venue_place_type: venueType,
          venue_place_size: placeType,
          country,
          city,
          catering_id,
          menu_id,
          venueType_id,
          facilities_id,
          allowedEvents_id,
          parking_id,
          location_id,
          venue_name: venueName,
          venue_title: venueTitle,
          venue_price: venuePrice,
          about: about,
          venue_capacity: venueCapacity,
        }
      ])
      .select("venue_id")
      .single();

    if (venueError) throw venueError;

    // Then insert the venue policies
    const { venuePolicies } = formData;
    const { data: policiesData, error: policiesError } = await supabase
      .from("venue_policies")
      .insert([
        {
          venue_id: venueData.venue_id,
          requires_deposit: venuePolicies.requires_deposit,
          deposit_amount_percentage: venuePolicies.deposit_amount_percentage || null,
          allows_cancellation: venuePolicies.allows_cancellation,
          cancellation_notice_days: venuePolicies.cancellation_notice_days,
          refund_on_time_policy: venuePolicies.refund_on_time_policy,
          refund_percentage: venuePolicies.refund_percentage || null,
          late_cancellation_policy: venuePolicies.late_cancellation_policy,
          late_cancellation_fee_percentage: venuePolicies.late_cancellation_fee_percentage || null
        }
      ]);

    if (policiesError) throw policiesError;

    res.json({
      message: "Thanks! Your venue details have been added and are now under review. One of our team members will approve it soon.",
      venueData,
    });
  } catch (error) {
    console.error("Error inserting venue data:", error);
    res.status(400).json({ error: error.message });
  }
});

router.post("/insertTable", async (req, res) => {
  const allowedTables = [
    "catering",
    "menu",
    "venueType",
    "facilities",
    "allowedEvents",
    "parking",
    "location",
  ];
  const { tableName, dataObj } = req.body;
  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ error: "Table not allowed." });
  }
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert([dataObj])
      .select(`${tableName}_id`)
      .single();

    if (error) throw error;

    res.json({ id: data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/venueImages", upload.any(), async (req, res) => {
  const { venueId } = req.body;
  const files = req.files;

  if (!venueId || !files?.length) {
    return res.status(400).json({ error: "Missing venueId or files" });
  }

  try {
    const uploadResults = [];

    for (let file of files) {
      const isMain = file.fieldname === "mainImage";
      const timestamp = Date.now();
      const filePath = `${venueId}/${timestamp}_${file.originalname}`;

      console.log("Uploading:", {
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        path: filePath,
      });

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("venue-images")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload failed:", uploadError.message);
        return res.status(500).json({ error: uploadError.message });
      }

      const { data: publicData } = supabase.storage
        .from("venue-images")
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;

      // Insert image record to DB
      const { data: imageRecord, error: insertError } = await supabase
        .from("images")
        .insert([
          {
            venue_id: venueId,
            image_url: publicUrl,
            is_main: isMain,
          },
        ])
        .single();

      if (insertError) {
        console.error("DB insert error:", insertError.message);
        return res.status(500).json({ error: insertError.message });
      }

      uploadResults.push(imageRecord);
    }

    return res.json({
      success: true,
      message: "Images uploaded successfully!",
      images: uploadResults,
    });
  } catch (err) {
    console.error("Unexpected error:", err.message);
    return res.status(500).json({ error: "Server error during image upload." });
  }
});



module.exports = router;
