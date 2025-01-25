interface ChatInputDropzoneProps {
  isDragActive: boolean;
}
const ChatInputDropzone = ({ isDragActive }: ChatInputDropzoneProps) => {
  if (!isDragActive) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b bg-secondary bg-opacity-90 rounded-3xl z-[2000]">
      <p className="text-foreground text-lg">Drop files here...</p>
      <p className="text-foreground text-sm mt-2">
        Supported formats:
        <span className="font-semibold">.shp (zipped shapefile)</span>,
        <span className="font-semibold">.geojson</span>,
        {/* <span className="font-semibold">.pdf</span>,
        <span className="font-semibold">.txt</span>,
        <span className="font-semibold">.docx</span> */}
      </p>
    </div>
  );
};

export default ChatInputDropzone;
