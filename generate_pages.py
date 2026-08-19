import os

with open('/Users/aqib/work/expence_tracker/espere-pages/index.html', 'r') as f:
    html = f.read()

part_a = html.split('    const Hero = () => {')[0]
part_b = '    const Footer = () => {' + html.split('    const Footer = () => {')[1]

# In part_b, modify App component
part_b = part_b.replace('<Hero />', '<PageContent />')
part_b = part_b.replace('<Features />', '')
part_b = part_b.replace('<CTA />', '')

def create_page(filename, page_content_js, title):
    new_part_a = part_a.replace('<title>Espere - Intelligent Expense & Group Settlement</title>', f'<title>{title} - Espere</title>')
    new_part_a = new_part_a.replace('href="#features"', 'href="index.html#features"')
    new_part_a = new_part_a.replace('href="#faq"', 'href="faq.html"')
    
    content = new_part_a + page_content_js + '\n' + part_b
    
    # Also fix footer links in the new pages
    content = content.replace('href="#" className="hover:text-black transition-colors">Privacy Policy</a>', 'href="privacy.html" className="hover:text-black transition-colors">Privacy Policy</a>')
    content = content.replace('href="#" className="hover:text-black transition-colors">Terms of Service</a>', 'href="terms.html" className="hover:text-black transition-colors">Terms of Service</a>')
    content = content.replace('href="#" className="hover:text-brand transition-colors">Contact Support</a>', 'href="contact.html" className="hover:text-brand transition-colors">Contact Support</a>')
    
    with open(f'/Users/aqib/work/expence_tracker/espere-pages/{filename}', 'w') as f:
        f.write(content)

faq_content = """
    const PageContent = () => {
      return (
        <section className="pt-32 pb-24 px-6 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black mb-8">Frequently Asked Questions</h1>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                <h3 className="text-xl font-bold mb-2">Is Espere free?</h3>
                <p className="text-dark/70">Yes, the core features of Espere including personal expense tracking and group settlements are completely free.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                <h3 className="text-xl font-bold mb-2">How does the Offline-First architecture work?</h3>
                <p className="text-dark/70">Espere is built as a native app that stores your data locally first. You can add expenses and manage groups without an internet connection. Once you reconnect, it seamlessly syncs with the cloud.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                <h3 className="text-xl font-bold mb-2">Can I export my data?</h3>
                <p className="text-dark/70">Yes, you can easily export your data and generate high-fidelity PDF reports for all your personal and group expenses.</p>
              </div>
            </div>
          </div>
        </section>
      )
    }
"""

privacy_content = """
    const PageContent = () => {
      return (
        <section className="pt-32 pb-24 px-6 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black mb-8">Privacy Policy</h1>
            <p className="text-dark/70 mb-8 font-medium">Last updated: August 2026</p>
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">1. Data Collection</h3>
                <p className="text-dark/70 leading-relaxed">We collect information that you provide directly to us when you create an account, create groups, or add expenses. This includes your name, email address, and financial tracking data.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">2. Use of Information</h3>
                <p className="text-dark/70 leading-relaxed">Your information is solely used to provide the Espere service, including syncing across your devices and settling group debts. We do not sell your personal data to third parties.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">3. Data Security</h3>
                <p className="text-dark/70 leading-relaxed">We implement industry-standard security measures to protect your data both in transit and at rest. Your passwords and sensitive information are securely hashed and encrypted.</p>
              </div>
            </div>
          </div>
        </section>
      )
    }
"""

terms_content = """
    const PageContent = () => {
      return (
        <section className="pt-32 pb-24 px-6 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black mb-8">Terms of Service</h1>
            <p className="text-dark/70 mb-8 font-medium">Last updated: August 2026</p>
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h3>
                <p className="text-dark/70 leading-relaxed">By accessing and using Espere, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">2. User Conduct</h3>
                <p className="text-dark/70 leading-relaxed">You agree to use Espere only for lawful purposes. You are responsible for all activities that occur under your account.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">3. Service Availability</h3>
                <p className="text-dark/70 leading-relaxed">While we strive for 100% uptime, Espere is provided "as is" and "as available" without warranties of any kind.</p>
              </div>
            </div>
          </div>
        </section>
      )
    }
"""

contact_content = """
    const PageContent = () => {
      return (
        <section className="pt-32 pb-24 px-6 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black mb-8">Contact Support</h1>
            <p className="text-dark/70 text-lg mb-8 font-medium">Have a question or need help with Espere? We're here for you.</p>
            
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-black/5 flex flex-col md:flex-row gap-12">
               <div className="flex-1">
                 <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
                 <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Message sent! We'll get back to you soon."); }}>
                   <div>
                     <label className="block text-sm font-bold mb-2 text-dark">Name</label>
                     <input type="text" required className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 border border-black/5 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" placeholder="Your name" />
                   </div>
                   <div>
                     <label className="block text-sm font-bold mb-2 text-dark">Email</label>
                     <input type="email" required className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 border border-black/5 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" placeholder="Your email address" />
                   </div>
                   <div>
                     <label className="block text-sm font-bold mb-2 text-dark">Message</label>
                     <textarea rows="4" required className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 border border-black/5 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" placeholder="How can we help?"></textarea>
                   </div>
                   <button type="submit" className="bg-dark text-white font-black px-6 py-4 rounded-xl hover:bg-black transition-colors w-full shadow-md">Send Message</button>
                 </form>
               </div>
               
               <div className="w-full md:w-1/3 flex flex-col gap-8 bg-[#F5F5F5] p-6 rounded-2xl border border-black/5">
                 <div>
                   <h4 className="font-bold mb-2 flex items-center gap-2 text-dark"><i className="ph-fill ph-envelope-simple text-brand text-2xl"></i> Email</h4>
                   <p className="text-dark/70 text-[15px] font-medium">support@espere.in</p>
                 </div>
                 <div>
                   <h4 className="font-bold mb-2 flex items-center gap-2 text-dark"><i className="ph-fill ph-map-pin text-brand text-2xl"></i> Office</h4>
                   <p className="text-dark/70 text-[15px] font-medium">Bangalore, India</p>
                 </div>
               </div>
            </div>
          </div>
        </section>
      )
    }
"""

create_page('faq.html', faq_content, "FAQ")
create_page('privacy.html', privacy_content, "Privacy Policy")
create_page('terms.html', terms_content, "Terms of Service")
create_page('contact.html', contact_content, "Contact Support")

# Now update links in index.html as well
html = html.replace('href="#faq"', 'href="faq.html"')
html = html.replace('href="#" className="hover:text-black transition-colors">Privacy Policy</a>', 'href="privacy.html" className="hover:text-black transition-colors">Privacy Policy</a>')
html = html.replace('href="#" className="hover:text-black transition-colors">Terms of Service</a>', 'href="terms.html" className="hover:text-black transition-colors">Terms of Service</a>')
html = html.replace('href="#" className="hover:text-brand transition-colors">Contact Support</a>', 'href="contact.html" className="hover:text-brand transition-colors">Contact Support</a>')

with open('/Users/aqib/work/expence_tracker/espere-pages/index.html', 'w') as f:
    f.write(html)

print("Success!")
