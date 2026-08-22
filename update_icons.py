import glob
import re

html_files = glob.glob('/Users/aqib/work/expence_tracker/espere-pages/*.html')

for file in html_files:
    with open(file, 'r') as f:
        html = f.read()

    # We want to find containers of icons. A container is typically a <div> or <span> with a bg color,
    # containing an <i class="ph-..."> tag.
    # To be safe, we will manually replace the exact strings we found above that don't match the new rule.
    
    replacements = [
        # about.html
        ('bg-[#C8E64A]/20 rounded-2xl flex items-center justify-center', 'bg-brand rounded-2xl flex items-center justify-center'),
        ('ph-fill ph-target text-[#C8E64A]', 'ph-fill ph-target text-dark'),
        
        ('bg-[#C8E64A]/10 rounded-2xl flex items-center justify-center', 'bg-brand rounded-2xl flex items-center justify-center'),
        ('ph-fill ph-lightbulb text-[#C8E64A]', 'ph-fill ph-lightbulb text-dark'),
        
        ('bg-white rounded-full flex items-center justify-center shadow-sm mb-6 animate-float', 'bg-brand rounded-full flex items-center justify-center shadow-sm mb-6 animate-float'),
        ('ph-bold ph-shield-check text-brand', 'ph-bold ph-shield-check text-dark'),
        
        ('bg-white rounded-full flex items-center justify-center shadow-sm mb-6 animate-float-delayed', 'bg-brand rounded-full flex items-center justify-center shadow-sm mb-6 animate-float-delayed'),
        ('ph-bold ph-magic-wand text-brand', 'ph-bold ph-magic-wand text-dark'),
        
        ('bg-dark rounded-3xl flex items-center justify-center mx-auto mb-8', 'bg-brand rounded-3xl flex items-center justify-center mx-auto mb-8'),
        ('ph-bold ph-github-logo text-[#C8E64A]', 'ph-bold ph-github-logo text-dark'),

        ('ph-bold ph-users text-brand', 'ph-bold ph-users text-dark'),

        # terms, faq, privacy (the header icons)
        ('bg-brand/20 rounded-3xl flex items-center justify-center', 'bg-brand rounded-3xl flex items-center justify-center'),
        ('ph-bold ph-file-text text-brand', 'ph-bold ph-file-text text-dark'),
        ('ph-bold ph-question text-brand', 'ph-bold ph-question text-dark'),
        ('ph-bold ph-shield-check text-brand', 'ph-bold ph-shield-check text-dark'),

        # faq (accordion arrow)
        ('bg-[#F5F5F5] text-brand transition-transform', 'bg-brand text-dark transition-transform'),
        # faq selected state bg-dark
        ("isOpen ? 'rotate-180 bg-dark' : ''", "isOpen ? 'rotate-180 bg-dark text-white' : ''"),

        # privacy / terms side icons
        ('bg-[#F5F5F5] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand/20 transition-colors duration-300', 'bg-brand rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-hover transition-colors duration-300'),
        ('text-dark group-hover:text-brand transition-colors', 'text-dark transition-colors'),
        ('bg-[#F5F5F5] rounded-xl flex items-center', 'bg-brand rounded-xl flex items-center'),
        
        # index.html
        ('bg-[#1A1A1A] rounded-[24px] p-5 flex flex-col items-center justify-center text-center gap-2 shadow-elevated border border-black/5', 'bg-brand rounded-[24px] p-5 flex flex-col items-center justify-center text-center gap-2 shadow-elevated border border-black/5'),
        ('ph-fill ph-users-three text-[#C8E64A] text-4xl', 'ph-fill ph-users-three text-dark text-4xl'),
        ('text-[#C8E64A] text-sm font-black mt-1', 'text-dark text-sm font-black mt-1'),
        ('text-gray-400 text-[10px] font-medium', 'text-dark/70 text-[10px] font-medium'),

        ('ph-fill ph-download-simple text-[#C8E64A] text-4xl', 'ph-fill ph-download-simple text-dark text-4xl'),

        ('bg-brand/20 flex items-center justify-center mb-6 shadow-sm group-hover:bg-brand/30', 'bg-brand flex items-center justify-center mb-6 shadow-sm group-hover:bg-brand-hover'),
        ('bg-brand/20 flex items-center justify-center mb-6 shadow-sm group-hover:bg-brand/40', 'bg-brand flex items-center justify-center mb-6 shadow-sm group-hover:bg-brand-hover'),

        ('bg-gray-200 flex items-center justify-center border-4 border-white shadow-sm -ml-5 z-10 text-muted transform group-hover:scale-110 group-hover:bg-dark group-hover:text-brand', 'bg-brand flex items-center justify-center border-4 border-white shadow-sm -ml-5 z-10 text-dark transform group-hover:scale-110 group-hover:bg-dark group-hover:text-white'),

        ('bg-white/10 border border-white/5 flex items-center justify-center mb-6 text-brand', 'bg-brand border border-white/5 flex items-center justify-center mb-6 text-dark'),
        ('bg-white/10 border border-white/5 flex items-center justify-center mb-8 text-brand', 'bg-brand border border-white/5 flex items-center justify-center mb-8 text-dark'),
        
        ('bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-12 animate-bounce', 'bg-brand backdrop-blur-md rounded-2xl border border-black/10 flex items-center justify-center transform -rotate-12 animate-bounce'),
        ('bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center transform rotate-12 animate-bounce', 'bg-brand backdrop-blur-md rounded-2xl border border-black/10 flex items-center justify-center transform rotate-12 animate-bounce'),
        ('ph-fill ph-wallet text-3xl text-brand', 'ph-fill ph-wallet text-3xl text-dark'),
        ('ph-fill ph-users-three text-4xl text-brand', 'ph-fill ph-users-three text-4xl text-dark'),
    ]

    for old, new in replacements:
        html = html.replace(old, new)
    
    with open(file, 'w') as f:
        f.write(html)

print("Updated icons across files.")
