import Image from "next/image";

export default function Hero() {
  return (
    <section className="pt-48 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col max-w-7xl mx-auto gap-y-12">
        <div className="flex flex-col lg:flex-row justify-center items-center w-full space-y-12 lg:space-y-0 lg:space-x-12">
          <Image src="/placeholder.svg" alt="Miguel Lourenço" width={400} height={100} className="rounded-full" />
          <div className="flex flex-col items-center text-center gap-y-6">
            <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Hi, I'm{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Miguel Lourenço
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              I’m an engineer who loves building systems—especially websites. I enjoy the whole lifecycle, from designing architecture and choosing tools, to shaping UX flows and crafting UI. I’m looking for a role where I can do exactly that.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 