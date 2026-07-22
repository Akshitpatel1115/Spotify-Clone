const AuthLayout = ({ children }) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#121212] px-4 py-12">
      
      {/* Fixed background to prevent scrolling overflow issues */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Top Glow */}
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />

        {/* Bottom Glow */}
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;