import { MessageCircle } from "lucide-react";

export default function ChatEmptyState() {
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-slate-50 px-4 py-8 text-center">
      <div className="max-w-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <MessageCircle className="h-8 w-8" />
        </div>

        <h2 className="mt-5 break-words text-lg font-bold text-slate-900 sm:text-xl">
          Select a conversation
        </h2>

        <p className="mt-2 break-words text-sm leading-6 text-slate-600">
          Choose a chat from the left to view messages related to that job.
        </p>
      </div>
    </div>
  );
}