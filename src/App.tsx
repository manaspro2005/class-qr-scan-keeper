import { AuthProvider } from "@/lib/auth";
import TeacherDashboard from "@/pages/TeacherDashboard";
import { Toaster } from "sonner";

function App() {
  return (
    <AuthProvider>
      <TeacherDashboard />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
