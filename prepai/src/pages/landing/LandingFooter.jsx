const LandingFooter = () => {
  return (
    <footer id="contact" className="border-t border-white/10 px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
        <div className="text-sm text-slate-300">
          <div className="font-semibold text-white">Contact</div>
          <div className="mt-2 space-y-1">
            <div>
              <span className="font-medium">Toufeeq Mir</span>{" "}
              <a className="text-slate-300 underline underline-offset-4 hover:text-white" href="mailto:Toufeeqmir124@gmail.com">
                Toufeeqmir124@gmail.com
              </a>
            </div>
            <div>
              <span className="font-medium">Sajad Bashir Mir</span>{" "}
              <a className="text-slate-300 underline underline-offset-4 hover:text-white" href="mailto:mirsajad0001@gmail.com">
                mirsajad0001@gmail.com
              </a>
            </div>
             <div>
              <span className="font-medium">Mohd. Ali</span>{" "}
              <a className="text-slate-300 underline underline-offset-4 hover:text-white" href="mailto:mirsajad0001@gmail.com">
                mdAli12@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="text-[13px] text-slate-400">PrepAI — AI Powered Interview Training Platform</div>
      </div>
    </footer>
  );
};

export default LandingFooter;

