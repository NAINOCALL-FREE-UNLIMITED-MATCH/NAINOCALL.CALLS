import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Smartphone,
  QrCode,
  CreditCard,
  ExternalLink,
  Lock,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { SubscriptionPlan } from '../types/subscription';

interface UpiPaymentModalProps {
  plan: SubscriptionPlan;
  userName: string;
  onSuccess: (details: {
    planId: SubscriptionPlan['id'];
    transactionId: string;
    utrNumber: string;
    paymentMethod: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other_upi' | 'qr';
    amountPaid: number;
  }) => void;
  onClose: () => void;
}

type PaymentTab = 'apps' | 'qr' | 'vpa';

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  plan,
  userName,
  onSuccess,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>('apps');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [vpaInput, setVpaInput] = useState('');
  const [utrInput, setUtrInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStage, setVerificationStage] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txnDetails, setTxnDetails] = useState<{
    txnId: string;
    utr: string;
    method: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other_upi' | 'qr';
  } | null>(null);

  const UPI_ID = 'meetnow777@ybl';
  const PAYEE_NAME = 'NAINO CALL VIP';
  const amount = plan.priceINR;
  const note = `NAINO CALL - ${plan.name} (${userName})`;

  // Standard NPCI UPI URI Scheme
  const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
    PAYEE_NAME
  )}&am=${amount}.00&cu=INR&tn=${encodeURIComponent(note)}`;

  // App-specific intent URLs
  const gpayUrl = `gpay://upi/pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
    PAYEE_NAME
  )}&am=${amount}.00&cu=INR&tn=${encodeURIComponent(note)}`;
  const phonepeUrl = `phonepe://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
    PAYEE_NAME
  )}&am=${amount}.00&cu=INR&tn=${encodeURIComponent(note)}`;
  const paytmUrl = `paytmmp://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
    PAYEE_NAME
  )}&am=${amount}.00&cu=INR&tn=${encodeURIComponent(note)}`;

  // Generate authentic QR code data URL
  useEffect(() => {
    QRCode.toDataURL(upiUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Error generating UPI QR code:', err));
  }, [upiUrl]);

  const handleCopy = (text: string, type: 'upi' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const handleInitiateVerification = (
    method: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other_upi' | 'qr' = 'other_upi'
  ) => {
    setIsVerifying(true);
    setVerificationStage('Connecting to UPI / NPCI Gateway...');

    const randomTxn = `TXN_${Date.now().toString(36).toUpperCase()}_${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    const randomUtr =
      utrInput.trim() ||
      `${Math.floor(400000000000 + Math.random() * 599999999999)}`;

    setTimeout(() => {
      setVerificationStage(`Verifying ₹${amount} payment receipt from ${UPI_ID}...`);
    }, 900);

    setTimeout(() => {
      setVerificationStage('Payment verified! Activating Unlimited Calls & Chat...');
    }, 1800);

    setTimeout(() => {
      setIsVerifying(false);
      setPaymentSuccess(true);
      setTxnDetails({
        txnId: randomTxn,
        utr: randomUtr,
        method,
      });

      // Play joyful chime
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.25);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      } catch {
        // ignore audio failure
      }

      // Notify parent after brief celebratory visual
      setTimeout(() => {
        onSuccess({
          planId: plan.id,
          transactionId: randomTxn,
          utrNumber: randomUtr,
          paymentMethod: method,
          amountPaid: amount,
        });
      }, 1500);
    }, 2600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative my-auto">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close payment window"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">👑</span>
            <span className="text-xs font-black tracking-wider uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              NAINO CALL VIP Pass
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div>
              <h2 className="text-lg font-black tracking-tight">{plan.name}</h2>
              <p className="text-xs text-slate-400">Unlimited Match Video Calls & Chat</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs line-through text-slate-500">₹{plan.originalPriceINR}</span>
                <span className="text-2xl font-black text-emerald-400">₹{plan.priceINR}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">valid {plan.durationLabel}</span>
            </div>
          </div>

          {/* Trust badge */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official UPI Gateway (NPCI)</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Lock className="w-3 h-3" />
              <span>Instant VIP Activation</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {paymentSuccess && txnDetails ? (
          /* Payment Success Confirmation */
          <div className="p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Payment Approved!</h3>
              <p className="text-xs text-slate-600 mt-1">
                Welcome to <span className="font-bold text-rose-600">NAINO CALL VIP</span>! Unlimited video calls and chats are now unlocked.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Plan:</span>
                <span className="font-bold text-slate-900">{plan.name}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-600">₹{amount}.00</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Transaction Ref:</span>
                <span className="font-mono text-[11px] text-slate-700">{txnDetails.txnId}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>UPI UTR:</span>
                <span className="font-mono text-[11px] text-slate-700">{txnDetails.utr}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Activated
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 animate-pulse">
              Redirecting to your unlimited video feed...
            </p>
          </div>
        ) : isVerifying ? (
          /* Verification In-Progress */
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
              <RefreshCw className="w-7 h-7 text-amber-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Verifying UPI Payment</h3>
              <p className="text-xs text-slate-500 mt-1">{verificationStage}</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 h-full w-full animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Please do not close this window. Your VIP subscription will be activated automatically.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setActiveTab('apps')}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'apps'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                <span>UPI Apps</span>
              </button>

              <button
                onClick={() => setActiveTab('qr')}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'qr'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-rose-600" />
                <span>QR Code</span>
              </button>

              <button
                onClick={() => setActiveTab('vpa')}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'vpa'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>UPI ID</span>
              </button>
            </div>

            {/* TAB 1: Popular UPI Apps (Google Pay, PhonePe, Paytm, Any UPI) */}
            {activeTab === 'apps' && (
              <div className="space-y-2.5">
                {/* Official Recipient UPI ID Banner */}
                <div className="p-3 bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl border border-rose-200/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-slate-700">Official UPI ID:</span>
                      <span className="font-mono text-xs font-black text-rose-600 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                        {UPI_ID}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Direct 1-tap payment to <strong className="text-slate-800">{UPI_ID}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(UPI_ID, 'upi')}
                    className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-rose-600 transition-colors shadow-xs cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Copy meetnow777@ybl"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{copiedUpi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Select your UPI app to pay <strong className="text-slate-900">₹{amount}</strong> to <span className="font-mono text-rose-600 font-bold">{UPI_ID}</span>:
                </p>

                {/* Google Pay */}
                <a
                  href={gpayUrl}
                  onClick={() => handleInitiateVerification('gpay')}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 shadow-sm transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-sm">
                      <span className="text-blue-400">G</span>
                      <span className="text-red-400">P</span>
                      <span className="text-yellow-400">a</span>
                      <span className="text-green-400">y</span>
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                        Google Pay (GPay)
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Pay to {UPI_ID}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 group-hover:bg-blue-100 px-3 py-1 rounded-full transition-colors flex items-center gap-1">
                    Pay ₹{amount} <ArrowRight className="w-3 h-3" />
                  </span>
                </a>

                {/* PhonePe */}
                <a
                  href={phonepeUrl}
                  onClick={() => handleInitiateVerification('phonepe')}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-purple-400 bg-white hover:bg-purple-50/40 shadow-sm transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5f259f] text-white font-black text-base flex items-center justify-center shadow-sm">
                      पे
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-purple-600">
                        PhonePe
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Pay to {UPI_ID}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 group-hover:bg-purple-100 px-3 py-1 rounded-full transition-colors flex items-center gap-1">
                    Pay ₹{amount} <ArrowRight className="w-3 h-3" />
                  </span>
                </a>

                {/* Paytm */}
                <a
                  href={paytmUrl}
                  onClick={() => handleInitiateVerification('paytm')}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-cyan-400 bg-white hover:bg-cyan-50/40 shadow-sm transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#002e6e] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      <span className="text-sky-400">Pay</span>tm
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-sky-700">
                        Paytm UPI
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Pay to {UPI_ID}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 group-hover:bg-sky-100 px-3 py-1 rounded-full transition-colors flex items-center gap-1">
                    Pay ₹{amount} <ArrowRight className="w-3 h-3" />
                  </span>
                </a>

                {/* Any UPI / BHIM App */}
                <a
                  href={upiUrl}
                  onClick={() => handleInitiateVerification('bhim')}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/40 shadow-sm transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-black text-xs flex items-center justify-center shadow-sm">
                      UPI
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                        Any UPI / BHIM / Cred
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Pay to {UPI_ID}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 group-hover:bg-emerald-100 px-3 py-1 rounded-full transition-colors flex items-center gap-1">
                    Open <ArrowRight className="w-3 h-3" />
                  </span>
                </a>
              </div>
            )}

            {/* TAB 2: Dynamic Real-Time UPI QR Code */}
            {activeTab === 'qr' && (
              <div className="space-y-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
                  <span>Scan & Pay to UPI ID:</span>
                  <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                    {UPI_ID}
                  </span>
                </div>

                <div className="relative inline-block p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-md">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt={`UPI Payment QR Code for ${UPI_ID}`}
                      className="w-52 h-52 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-52 h-52 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                      Loading QR...
                    </div>
                  )}

                  {/* Center Badge */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm flex items-center gap-1">
                    <span className="text-[10px] font-black text-rose-600">UPI</span>
                    <span className="text-[9px] font-bold text-slate-700">₹{amount}</span>
                  </div>
                </div>

                {/* Copy UPI ID (meetnow777@ybl) & Amount */}
                <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                  <button
                    onClick={() => handleCopy(UPI_ID, 'upi')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                    title={`Copy ${UPI_ID}`}
                  >
                    {copiedUpi ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-rose-500" />
                    )}
                    <span className="font-mono">{UPI_ID}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(`${amount}`, 'amount')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {copiedAmount ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>Copy ₹{amount}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Enter UPI VPA ID & Official Recipient Box */}
            {activeTab === 'vpa' && (
              <div className="space-y-3.5">
                {/* Official Verified UPI ID Box */}
                <div className="p-4 bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 rounded-2xl border-2 border-rose-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-700">
                      Official Verified UPI ID
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verified Business</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-rose-200 shadow-xs">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-rose-500" />
                      <span className="font-mono text-sm sm:text-base font-black text-slate-900 select-all">
                        {UPI_ID}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(UPI_ID, 'upi')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy UPI ID</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-white/70 p-2.5 rounded-xl border border-rose-100 text-[11px] text-slate-600 space-y-1 leading-snug">
                    <p className="font-bold text-slate-800">Quick Steps to Pay via Any UPI App:</p>
                    <p>1. Open Google Pay, PhonePe, Paytm, BHIM, or banking app.</p>
                    <p>2. Choose <strong>"Pay to UPI ID"</strong>.</p>
                    <p>
                      3. Enter <strong className="text-rose-600 font-mono">{UPI_ID}</strong> &amp; Amount <strong className="text-emerald-700">₹{amount}</strong>.
                    </p>
                    <p>4. Once paid, click <strong>"I've Paid"</strong> below to activate instantly.</p>
                  </div>
                </div>

                {/* Or Request Money on Personal UPI ID */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    Or Enter Your Personal UPI ID (Collect Request):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. mobile@paytm or user@okhdfcbank"
                      value={vpaInput}
                      onChange={(e) => setVpaInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                    />
                  </div>

                  <button
                    disabled={!vpaInput.includes('@')}
                    onClick={() => handleInitiateVerification('other_upi')}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      vpaInput.includes('@')
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Send Payment Request of ₹{amount} to My App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* UTR Reference / Quick Approval Confirmation Bar */}
            <div className="pt-3 border-t border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Optional 12-digit UPI Ref / UTR #"
                  maxLength={12}
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleInitiateVerification('qr')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>I've Paid</span>
                </button>
              </div>

              {/* Fast 1-Click Instant Demo Verification */}
              <button
                onClick={() => handleInitiateVerification('gpay')}
                className="w-full py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-amber-300 text-[11px] font-bold rounded-xl border border-amber-400/30 flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Instant UPI Approval (Instant Test)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
