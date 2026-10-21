import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { BorderBeam } from "@/components/BorderBeam";
import { Button } from "@/components/ui/button";

const EMAIL = "lb15058460816@gmail.com";

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // 部分浏览器（或 file:// 下）没有剪贴板权限，退回到选中文本
      const ta = document.createElement("textarea");
      ta.value = EMAIL;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    toast("邮箱已复制");
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <motion.section
      id="contact"
      className="mx-auto mt-24 w-full max-w-[720px] scroll-mt-24 px-5 sm:mt-28 sm:px-6"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="mb-6 text-[22px] font-semibold tracking-[-0.02em]">联系我</h2>
      <div className="relative overflow-hidden rounded-2xl border border-line bg-panel/60 p-6 sm:p-8">
        <BorderBeam />
        <p className="text-[15px] text-muted">想聊聊的话，发封邮件吧。</p>
        <a
          href={`mailto:${EMAIL}`}
          className="group mt-3 block break-all text-[clamp(20px,5.6vw,30px)] font-semibold leading-tight tracking-[-0.02em]"
        >
          <span className="ul-hover">{EMAIL}</span>
        </a>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <a href={`mailto:${EMAIL}`}>
              <Mail /> 发邮件
            </a>
          </Button>
          <Button variant="outline" onClick={copy}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? "ok" : "cp"}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.14 }}
                className="flex"
              >
                {copied ? <Check /> : <Copy />}
              </motion.span>
            </AnimatePresence>
            {copied ? "已复制" : "复制邮箱"}
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
