import ImageCrop from "./components/ImageCrop";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Image Crop Demo</h1>
      <ImageCrop />
    </main>
  );
}
