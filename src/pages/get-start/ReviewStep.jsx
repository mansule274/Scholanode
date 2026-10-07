import { ClipboardCheck, LockKeyhole } from 'lucide-react';
import { ReviewItem, SectionHeader } from './formComponents';

export default function ReviewStep({ formData, selectedTierData, billingCycle }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5 sm:p-7">
        <SectionHeader icon={<ClipboardCheck size={24} />} title="Review Your Details" description="Please confirm your information before creating your school account." />

        <div className="mt-7 grid gap-6 md:grid-cols-4">
          <ReviewItem label="School" value={formData.schoolName || 'Not provided'} secondary={`${formData.schoolLevel || 'N/A'} • ${formData.ownershipType || 'N/A'}`} />

          <ReviewItem
            label="Owner"
            value={`${formData.adminFirstName || ''} ${formData.adminSurname || ''}`.trim() || 'Not provided'}
            secondary={formData.role === 'LEADER' ? (formData.schoolLevel === 'SECONDARY' ? 'Principal' : 'Head Teacher') : formData.role === 'VICE_LEADER' ? (formData.schoolLevel === 'SECONDARY' ? 'Vice Principal' : 'Vice Leader') : formData.role === 'ADMINISTRATOR' ? 'Administrator' : formData.role === 'EXAM_OFFICER' ? 'Exam Officer' : formData.role === 'STAFF' ? 'Staff' : formData.role || 'Role not selected'}
          />

          <ReviewItem label="Selected Plan" value={formData.plan === 'free' ? 'Free Plan' : 'Starter Plan'} secondary={formData.plan === 'starter' && selectedTierData ? `${selectedTierData.minStudents} - ${selectedTierData.maxStudents === null ? 'Unlimited' : selectedTierData.maxStudents} Students` : 'No payment required'} />

          <ReviewItem label="Billing" value={formData.plan === 'free' ? 'Free' : selectedTierData ? `₦${new Intl.NumberFormat('en-NG').format(selectedTierData[billingCycle].price)}` : 'TBD'} secondary={formData.plan === 'free' ? '₦0 / month' : `${billingCycle === 'MONTHLY' ? 'Monthly' : billingCycle === 'TERMLY' ? 'Termly' : 'Yearly'} billing`} />
        </div>
      </div>

      <div className="rounded-b-3xl bg-[#071A52] p-5 text-white sm:p-6">
        <div className="flex items-start gap-3">
          <LockKeyhole size={21} className="mt-1 shrink-0 text-cyan-300" />

          <div>
            <p className="text-sm font-medium">Your information is secure.</p>
            <p className="mt-1 text-xs text-white/60">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
