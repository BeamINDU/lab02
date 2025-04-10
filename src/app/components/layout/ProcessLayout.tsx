import { ProcessProvider } from "../../context/ProcessContext";

export default function ProcessLayout({ children }) {
  return <ProcessProvider>{children}</ProcessProvider>;
}