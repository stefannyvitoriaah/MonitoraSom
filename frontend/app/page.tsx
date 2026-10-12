import Image from "next/image";
import MainLayout from "@/components/mainlayout";
import UploadsSidebar from "@/components/loaded";
import AudioDropzone from "@/components/dragaudio";

export default function Home() {
  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] p-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
          <div className="hidden lg:flex lg:col-span-3 h-full flex-col">
            <UploadsSidebar />
          </div>
          <div className="col-span-1 lg:col-span-9 h-full">
            <AudioDropzone />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}