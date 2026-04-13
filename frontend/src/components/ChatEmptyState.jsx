export default function ChatEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">
        💬
      </div>
      <h2 className="text-2xl font-bold text-slate-900">
        Select a conversation
      </h2>
      <p className="mt-3 max-w-md text-slate-500">
        Choose an assigned worker or poster from the sidebar to start chatting
        about a job.
      </p>
    </div>
  );
}