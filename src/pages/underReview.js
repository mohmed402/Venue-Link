import "../styles/Inquiries.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

// import "/assets/user.png" from "../../public/assets/user.png";
// import "/assets/delete.png" from "/assets/delete.png";
// import "/assets/email.png" from "../../public/assets/email.png";
// import "/assets/info.png" from "../../public/assets/info.png";
import UserData from "@/components/userData";
import Chart from "../components/chart";
import InquirieInfo from "../components/inquirieInfo";
import AdminNav from "@/components/adminNav";
import ViewVenue from "@/components/viewVenue";

export default function UnderReview() {
  const [isReview, setIsReview] = useState(false);
  const [inquirId, setInquirId] = useState(null);
  const [dataHolder, setDataHolder] = useState(null);

  useEffect(() => {
    console.log("from main: ", inquirId);
  }, [inquirId]);
  return (
    <ProtectedRoute requiredPermission="canAccessReview">
      <div className="container">
        <AdminNav />
        <main>
          <header>
            <h1>To Review Box</h1>
            <div className="details">
              <InquirieInfo
                inquirId={inquirId}
                isReview={isReview}
                setIsReview={setIsReview}
                setDataHolder={setDataHolder}
              />
              <Chart />
            </div>
            {isReview && (
              <ViewVenue
                inquirId={inquirId}
                isReview={isReview}
                setIsReview={setIsReview}
                dataHolder={dataHolder}
              />
            )}
          </header>
          <UserData getId={setInquirId} setInquirId={setInquirId} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
