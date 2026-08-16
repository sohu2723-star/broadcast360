"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs font-semibold uppercase tracking-widest text-indigo-400">
            <MessageSquare className="w-3.5 h-3.5" />
            Get in Touch
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Contact <span className="text-indigo-400">BC 360</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Have questions, feedback, or business inquiries? We'd love to hear from you. Reach out to our team using the form or info below.
          </p>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CONTACT INFORMATION CARDS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-800/80 bg-[#0b132b]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              <h2 className="text-xl font-bold text-white">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Email Us</h3>
                    <p className="text-xs text-slate-400 mt-0.5">For support and general queries</p>
                    <a href="mailto:support@bc360.com" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors mt-1 inline-block">
                      support@bc360.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Call Us</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Mon–Fri from 9am to 6pm</p>
                    <a href="tel:+1234567890" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors mt-1 inline-block">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Office Location</h3>
                    <p className="text-xs text-slate-400 mt-0.5">BC 360 Headquarters</p>
                    <p className="text-sm text-slate-300 mt-1">
                      123 Digital Avenue, Suite 400<br />
                      Tech District, City 10001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Working Hours</h3>
                    <p className="text-sm text-slate-300 mt-1">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday - Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-800/80 bg-[#0b132b]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Thank you for contacting BC 360. Our team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 rounded-xl border border-slate-800 bg-[#070d1e] px-6 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-xl font-bold text-white">Send Us a Message</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Your Name</label>
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-slate-800 bg-[#070d1e] px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Email Address</label>
                      <input
                        required
                        type="email"
                        placeholder="john@example.com"
                        className="w-full rounded-xl border border-slate-800 bg-[#070d1e] px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Subject</label>
                    <input
                      required
                      type="text"
                      placeholder="How can we help?"
                      className="w-full rounded-xl border border-slate-800 bg-[#070d1e] px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Write your message here..."
                      className="w-full rounded-xl border border-slate-800 bg-[#070d1e] px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                    ></textarea>
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-[0.98] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}