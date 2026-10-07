import { UserRound } from 'lucide-react';
import { InfoBox, InputField, PasswordField, SectionHeader, SelectField } from './formComponents';

export default function AdministratorStep({ formData, updateField, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword }) {
  const roleOptions = [
    { value: 'LEADER', label: formData.schoolLevel === 'SECONDARY' ? 'Principal' : 'Head Teacher' },
    { value: 'VICE_LEADER', label: formData.schoolLevel === 'SECONDARY' ? 'Vice Principal' : 'Vice Leader' },
    { value: 'ADMINISTRATOR', label: 'Administrator' },
    { value: 'EXAM_OFFICER', label: 'Exam Officer' },
    { value: 'STAFF', label: 'Staff' },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <SectionHeader icon={<UserRound size={24} />} title="Owner Information" description="Create the initial school owner account." />

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <InputField label="First Name" required value={formData.adminFirstName} onChange={(event) => updateField('adminFirstName', event.target.value)} placeholder="John" />

        <InputField label="Surname" required value={formData.adminSurname} onChange={(event) => updateField('adminSurname', event.target.value)} placeholder="Doe" />

        <div className="sm:col-span-2">
          <InputField label="Email Address" required type="email" value={formData.adminEmail} onChange={(event) => updateField('adminEmail', event.target.value)} placeholder="owner@school.edu.ng" />
        </div>

        <div className="sm:col-span-2">
          <SelectField label="Role" required value={formData.role || 'LEADER'} onChange={(event) => updateField('role', event.target.value)} options={roleOptions} placeholder="Select a role" />
        </div>

        <PasswordField label="Password" required value={formData.password} visible={showPassword} onToggle={() => setShowPassword((previous) => !previous)} onChange={(event) => updateField('password', event.target.value)} placeholder="Create password" />

        <PasswordField label="Confirm Password" required value={formData.confirmPassword} visible={showConfirmPassword} onToggle={() => setShowConfirmPassword((previous) => !previous)} onChange={(event) => updateField('confirmPassword', event.target.value)} placeholder="Confirm password" />
      </div>

      <InfoBox>You will be able to add teachers, students and staff after registration.</InfoBox>
    </section>
  );
}
