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

router.post("/bookingDocuments", upload.any(), async (req, res) => {
  const { bookingId, uploadedBy, venueId = 86 } = req.body;
  const files = req.files;

  console.log('Document upload request received:', {
    bookingId,
    uploadedBy,
    venueId,
    filesCount: files?.length || 0,
    hasFiles: !!files?.length
  });

  if (!bookingId) {
    return res.status(400).json({ error: "Missing bookingId parameter" });
  }

  if (!files?.length) {
    return res.status(400).json({ error: "No files provided for upload" });
  }

  if (!uploadedBy) {
    console.warn('No uploadedBy parameter provided');
  }

  try {
    const uploadResults = [];

    for (let file of files) {
      const timestamp = Date.now();
      const filePath = `bookings/${bookingId}/documents/${timestamp}_${file.originalname}`;

      console.log("Processing file upload:", {
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        path: filePath,
        bookingId,
        venueId,
        uploadedBy
      });

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return res.status(400).json({ 
          error: `File ${file.originalname} is too large. Maximum size is 10MB.` 
        });
      }

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("booking-documents")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error("Supabase storage upload failed:", uploadError);
        return res.status(500).json({ 
          error: `Storage upload failed for ${file.originalname}: ${uploadError.message}` 
        });
      }

      console.log("File uploaded to storage successfully:", uploadData);

      const { data: publicData } = supabase.storage
        .from("booking-documents")
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;

      // Insert document record to DB with venue_id
      const { data: documentRecord, error: insertError } = await supabase
        .from("booking_documents")
        .insert([
          {
            booking_id: bookingId,
            venue_id: venueId,
            document_name: file.originalname,
            document_url: publicUrl,
            document_type: file.mimetype,
            document_size: file.size,
            uploaded_by: uploadedBy,
            uploaded_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Database insert failed:", insertError);
        // Try to clean up the uploaded file
        await supabase.storage
          .from("booking-documents")
          .remove([filePath]);
        
        return res.status(500).json({ 
          error: `Database insert failed for ${file.originalname}: ${insertError.message}` 
        });
      }

      console.log("Document record saved to database:", documentRecord);
      uploadResults.push(documentRecord);
    }

    console.log(`Successfully uploaded ${uploadResults.length} documents`);

    return res.json({
      success: true,
      message: `Successfully uploaded ${uploadResults.length} document(s)!`,
      documents: uploadResults,
    });
  } catch (error) {
    console.error("Unexpected error uploading booking documents:", error);
    res.status(500).json({ 
      error: `Server error: ${error.message}` 
    });
  }
});

// Get booking documents
router.get("/bookingDocuments/:bookingId", async (req, res) => {
  const { bookingId } = req.params;

  try {
    const { data: documents, error } = await supabase
      .from("booking_documents")
      .select("*")
      .eq("booking_id", bookingId)
      .order("uploaded_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      documents: documents || [],
    });
  } catch (error) {
    console.error("Error fetching booking documents:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete booking document
router.delete("/bookingDocuments/:documentId", async (req, res) => {
  const { documentId } = req.params;

  try {
    // First get the document to find the file path
    const { data: document, error: fetchError } = await supabase
      .from("booking_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (fetchError) throw fetchError;

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Extract file path from URL
    const urlParts = document.document_url.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'booking-documents');
    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("booking-documents")
      .remove([filePath]);

    if (storageError) {
      console.error("Storage deletion error:", storageError.message);
      // Continue with DB deletion even if storage deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("booking_documents")
      .delete()
      .eq("id", documentId);

    if (deleteError) throw deleteError;

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking document:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
