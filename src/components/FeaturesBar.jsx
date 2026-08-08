import { Shield, Cloud, RefreshCw, Headphones } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'Your data is encrypted and protected.',
  },
  {
    icon: Cloud,
    title: 'Cloud Based',
    desc: 'Access your school data anywhere.',
  },
  {
    icon: RefreshCw,
    title: 'Regular Updates',
    desc: 'New features and improvements.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    desc: 'Our team is always here to help.',
  },
];

export default function FeaturesBar() {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#071A52]">
              <feature.icon size={24} />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900">{feature.title}</h4>
              <p className="text-sm text-slate-500 mt-1">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}