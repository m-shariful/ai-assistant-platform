import { ChatPanel } from "./components/chat/ChatPanel";
import { Sidebar } from "./components/sidebar/Sidebar";
import { useChat } from "./hooks/useChat";

function App() {
  useChat();

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1">
        <ChatPanel />
      </main>
    </div>
  );
}

export default App;
