import { useState, useEffect, use } from "react";
import { useLocation , useParams } from 'wouter';
import AdvertisementForm from "@/components/admin/advertisements/advertisementForm"; 


export default function EditAdvertisementPage() {
  const params = useParams();

  const [, setLocation] = useLocation();
  const resolvedParams = params;
  const adId = Number(resolvedParams.id);

  const [adData, setAdData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/ads/${adId}`);
        if (!res.ok) throw new Error("Failed to fetch advertisement data.");
        
        const result = await res.json();
        setAdData(result.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (adId) fetchAdDetails();
  }, [adId]);

  async function handleEditSubmit(data: any) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("active", String(data.active));
    
    if (data.video) formData.append("video", data.video);
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

    const res = await fetch(`/api/ads/${adId}`, {
      method: "PUT",
      body: formData,
    });

    if (res.ok) {
      alert("Advertisement updated successfully!");
      setLocation("/ads");
      
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error("API Error Response From Server:", errorData);
      alert(errorData.message || "Update failed");
    }
  }

  if (loading) return <div className="p-6 text-white text-center">Loading Advertisement Data...</div>;
  if (error || !adData) return <div className="p-6 text-red-400 text-center">{error || "Data missing"}</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-5">Edit Advertisement</h1>
      <div className="mt-8">
        <AdvertisementForm 
          initialData={adData} 
          advertisementId={adId} 
          onSubmit={handleEditSubmit} 
        />
      </div>
    </div>
  );
}