import { Toaster as Sonner, type ToasterProps } from "sonner";

/** shadcn/ui 的 Sonner 封装：样式直接读本站的颜色变量 */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-center"
      offset={20}
      toastOptions={{
        unstyled: false,
        style: {
          background: "var(--fg)",
          color: "var(--bg)",
          border: "none",
          borderRadius: "999px",
          fontFamily: "var(--font-sans)",
          fontSize: "13.5px",
          fontWeight: 500,
          padding: "10px 16px",
          justifyContent: "center",
          width: "fit-content",
          marginInline: "auto",
        },
      }}
      {...props}
    />
  );
}
