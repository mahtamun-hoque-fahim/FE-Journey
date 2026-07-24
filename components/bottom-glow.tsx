export function BottomGlow() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-[500px] w-full"
      style={{
        background:
          "radial-gradient(circle at 50% 100%, rgba(61,244,154,0.18) 0%, rgba(61,244,154,0.06) 45%, rgba(61,244,154,0) 75%)",
        filter: "blur(60px)",
      }}
    />
  );
}
