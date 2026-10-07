import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkSchoolCode, createSchoolWithAdmin, getPlanPrice } from './registrationApi';
import AdministratorStep from './AdministratorStep';
import PlanSelectionStep from './PlanSelectionStep';
import RegistrationProgress from './RegistrationProgress';
import ReviewStep from './ReviewStep';
import SchoolInformationStep from './SchoolInformationStep';
import VerificationModal from './VerificationModal';

const steps = ['School Information', 'Owner Information', 'Choose Plan', 'Review & Finish'];

const initialFormData = {
  schoolName: '',
  schoolCode: '',
  schoolLevel: 'PRIMARY',
  ownershipType: 'GOVERNMENT',
  schoolAddress: '',
  adminFirstName: '',
  adminSurname: '',
  adminEmail: '',
  role: 'LEADER',
  password: '',
  confirmPassword: '',
  plan: 'free',
};

export default function GetStarted() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fetchedPlanPrice, setFetchedPlanPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registrationResponse, setRegistrationResponse] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [selectedTierData, setSelectedTierData] = useState(null);
  const [schoolCodeStatus, setSchoolCodeStatus] = useState('idle');

  useEffect(() => {
    if (formData.plan !== 'starter') return;
    getPlanPrice(formData.plan)
      .then((data) => {
        setFetchedPlanPrice(data);
        setSelectedTierData(data?.[0] || null);
      })
      .catch((error) => console.error('Error fetching plan price:', error?.response?.data || error.message))
      .finally(() => setLoading(false));
  }, [formData.plan]);

  useEffect(() => {
    const schoolCode = formData.schoolCode.trim();
    if (!schoolCode) return undefined;

    const timeoutId = window.setTimeout(async () => {
      try {
        setSchoolCodeStatus(await checkSchoolCode(schoolCode));
      } catch (error) {
        console.error('Error checking school code:', error?.response?.data || error.message);
        setSchoolCodeStatus('error');
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [formData.schoolCode]);

  const updateField = (field, value) => {
    if (field === 'schoolCode') setSchoolCodeStatus(value.trim() ? 'checking' : 'idle');
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handlePlanChange = (plan) => {
    updateField('plan', plan);
    if (plan === 'free') {
      setFetchedPlanPrice(null);
      setSelectedTierData(null);
      setLoading(false);
    } else {
      setLoading(true);
    }
  };

  const isStepComplete = (stepNumber) => {
    if (stepNumber === 1) return Boolean(formData.schoolName.trim() && schoolCodeStatus === 'available' && formData.schoolLevel && formData.ownershipType && formData.schoolAddress.trim());
    if (stepNumber === 2) return Boolean(formData.role && formData.adminFirstName.trim() && formData.adminSurname.trim() && formData.adminEmail.trim() && formData.password && formData.password === formData.confirmPassword);
    if (stepNumber === 3) return formData.plan === 'free' || Boolean(selectedTierData);
    return isStepComplete(1) && isStepComplete(2) && isStepComplete(3);
  };

  const handleNextStep = () => {
    if (isStepComplete(currentStep)) setCurrentStep((step) => Math.min(4, step + 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isStepComplete(4)) return;

    const schoolData = {
      schoolName: formData.schoolName,
      schoolCode: formData.schoolCode,
      schoolLevel: formData.schoolLevel,
      ownershipType: formData.ownershipType,
      address: formData.schoolAddress,
    };
    const adminData = {
      firstName: formData.adminFirstName,
      surName: formData.adminSurname,
      email: formData.adminEmail,
      password: formData.password,
      role: formData.role || 'LEADER',
    };
    const planData = {
      plan: formData.plan,
      tierId: formData.plan === 'starter' ? selectedTierData?.id : null,
      billingCycle: formData.plan === 'starter' ? billingCycle : null,
    };

    try {
      setLoading(true);
      const response = await createSchoolWithAdmin(schoolData, adminData, planData);

      // keep the registration response and show verification modal
      console.log('School registration response:', response);
      setRegistrationResponse(response);
      setShowVerificationModal(true);
    } catch (error) {
      console.error('School registration failed:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    if (formData.plan === 'free') {
      setShowVerificationModal(false);
      navigate('/admin');
      return;
    }

    navigate('/payment', {
      state: { registration: registrationResponse?.data || registrationResponse },
    });
  };

  const handleContinueToDashboard = () => {
    setShowVerificationModal(false);
    navigate('/admin');
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="px-4 pt-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-linear-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] text-white shadow-2xl"><div className="relative px-6 py-10 sm:px-10 lg:px-14 lg:py-14"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium"><Building2 size={17} /> School Registration</div><h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">Get Started with ScholaNode</h1><p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">Create your school account in a few simple steps and choose the plan that fits your school today.</p></div></div></section>

      <RegistrationProgress steps={steps} currentStep={currentStep} isStepComplete={isStepComplete} setCurrentStep={setCurrentStep} />

      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>{currentStep === 1 && <SchoolInformationStep formData={formData} updateField={updateField} schoolCodeStatus={schoolCodeStatus} />}{currentStep === 2 && <AdministratorStep formData={formData} updateField={updateField} showPassword={showPassword} setShowPassword={setShowPassword} showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword} />}</div>
          <div>{currentStep === 3 && <PlanSelectionStep formData={formData} handlePlanChange={handlePlanChange} billingCycle={billingCycle} setBillingCycle={setBillingCycle} fetchedPlanPrice={fetchedPlanPrice} loading={loading} selectedTierData={selectedTierData} setSelectedTierData={setSelectedTierData} />}</div>
        </div>

        {currentStep === 4 && <ReviewStep formData={formData} selectedTierData={selectedTierData} billingCycle={billingCycle} />}

        <div className="mt-8 flex justify-between gap-4">{currentStep > 1 && <button type="button" onClick={() => setCurrentStep((step) => Math.max(1, step - 1))} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"><ArrowLeft size={18} /> Go Back</button>}{currentStep < 4 && <button type="button" onClick={handleNextStep} disabled={!isStepComplete(currentStep)} className="ml-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0EA5E9] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#0284C7] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none">Next <ArrowRight size={18} /></button>}{currentStep === 4 && <button type="submit" disabled={loading} className="ml-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0EA5E9] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#0284C7] disabled:opacity-50">{loading ? 'Creating School...' : formData.plan === 'free' ? 'Create School' : 'Go to Payment & Proceed'} <ArrowRight size={18} /></button>}</div>

        <div className="flex items-start justify-center gap-2 px-4 pb-4 text-center text-sm text-slate-500"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#0EA5E9]" /><p>If you select the Free Plan, your school can start using ScholaNode without completing a payment.</p></div>
      </form>

      <VerificationModal
        open={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        registration={registrationResponse}
        onProceedToPayment={handleProceedToPayment}
        onContinueToDashboard={handleContinueToDashboard}
      />
    </main>
  );
}
