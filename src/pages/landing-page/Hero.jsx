import { ShieldCheck, Rocket, CheckCircle2 } from 'lucide-react';
import StudentPic from '../../assets/student.png';

export default function Hero({ onLoginClick }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] text-white shadow-2xl">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
      </div>

      <div className="relative grid lg:grid-cols-2 gap-10 items-center p-6 sm:p-10 lg:p-14">
        {/* Left Content */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur">
            <CheckCircle2 size={16} />
            Smarter Schools, Better Future
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              All-in-One School Management Solution
            </h2>

            <p className="text-white/80 text-lg leading-relaxed max-w-xl">
              ScholarNode helps schools manage students, teachers, classes,
              exams, finances, library, attendance, and more all in one
              secure cloud platform designed for modern education.
            </p>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <CheckCircle2 className="text-cyan-300" size={22} />
              <span className="font-medium">Easy to Use</span>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="text-cyan-300" size={22} />
              <span className="font-medium">Secure & Reliable</span>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <Rocket className="text-cyan-300" size={22} />
              <span className="font-medium">Built for Growth</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="px-6 py-3 rounded-2xl border border-white/30 text-white hover:bg-white/10 transition-all cursor-pointer">
              Watch Demo
            </button>
            <button className="px-6 py-3 rounded-2xl bg-white text-[#071A52] font-semibold hover:bg-slate-100 transition-all shadow-lg cursor-pointer">
              Start Free Trial
            </button>
            <button
              type="button"
              onClick={onLoginClick}
              className="px-6 py-3 rounded-2xl bg-[#0EA5E9] text-white font-semibold hover:bg-[#0284c7] transition-all shadow-lg cursor-pointer"
            >
              School Login
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-4 bg-white/10 rounded-[2rem] blur-2xl" />
            <img
              src={StudentPic}
              alt="Student"
              className="relative w-full rounded-[2rem] object-cover shadow-2xl border border-white/10"
            />
          </div>
        </div>
      </div>
    </section>
  );
}