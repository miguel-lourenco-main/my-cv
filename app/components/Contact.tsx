import EmailButton from "./EmailButton";
import GitlabButton from "./GitlabButton";
import LinkedInButton from "./LinkedInButton";

export default function Contact() {
  return (
    <section id="contact" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Get In Touch
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            I'm always interested in new opportunities, collaborations, and interesting conversations about technology.
          </p>
          {/* Social Links */}
          <div className="flex justify-center space-x-6">
            <GitlabButton width={46} height={46} />
            <LinkedInButton width={42} height={42} />
            <EmailButton width={52} height={52} />
          </div>
        </div>
      </div>
    </section>
  )
} 