const Loader = ({ fullScreen = false }) => {
  const loaderContent = (
    <div className="flex gap-2">
      <div className="h-3 w-3 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0s" }}></div>
      <div className="h-3 w-3 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.2s" }}></div>
      <div className="h-3 w-3 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.4s" }}></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center p-8">
      {loaderContent}
    </div>
  );
};

export default Loader;
