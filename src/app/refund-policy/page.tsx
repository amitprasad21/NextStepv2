import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Refund Policy | NextStep'
}

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="mx-auto w-full max-w-4xl px-6 py-20 flex-1">
        <div className="rounded-2xl border border-border/60 bg-card p-8 md:p-12 shadow-soft">
          <h1 className="text-3xl font-bold text-foreground mb-8" style={{ fontFamily: 'var(--font-sans)' }}>
            Refund Policy
          </h1>
          
          <div className="space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed">
            <p>Last updated: March 2026</p>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">1. General Policy</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Due to the real-time nature of our &quot;counselling sessions&quot; and &quot;campus visits&quot;, refunds are generally not provided once a booking is confirmed, except in cases of platform error or provider cancellation.</p>
              <p>At NextStep, our goal is to provide exceptional guidance. Because our premium counselling sessions and guided campus campus visits require advance coordination with experts and institutions, we enforce a strict but fair refund policy.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">2. Premium Counselling Sessions</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>100% Refund:</strong> If you cancel your session at least 48 hours before the scheduled time.</li>
                <li><strong>50% Refund:</strong> If you cancel your session between 24 and 48 hours before the scheduled time.</li>
                <li><strong>No Refund:</strong> For cancellations made less than 24 hours prior to the session, or for "no-shows".</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">3. Paid Campus Visits</h2>
              <p>If you have paid for a guided premium campus tour, full refunds are only issued if the cancellation is made at least 3 days (72 hours) in advance. Institutional gate passes are non-transferable and often non-refundable closer to the date.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">4. Service Disruptions</h2>
              <p>If NextStep or the destination college cancels a scheduled visit or counselling session due to unforeseen circumstances, you are entitled to a 100% full refund or a free rescheduling of the event, based on your preference.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">5. Processing Time</h2>
              <p>Approved refunds will be processed back to the original method of payment within 5-7 business days depending on your banking institution.</p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
