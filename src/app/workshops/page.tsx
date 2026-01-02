

export default function WorkshopsPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-primary mb-8 glitch-text">WORKSHOPS</h1>
            <p className="text-gray-400 mb-8">Hands-on training from industry experts.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    {
                        title: "Ethical Hacking 101",
                        description: "Learn the basics of penetration testing.",
                        type: "Workshop",
                        date: "March 15, 2025"
                    },
                    {
                        title: "Cloud Security",
                        description: "Securing AWS & Azure infrastructure.",
                        type: "Workshop",
                        date: "March 16, 2025"
                    }
                ].map((item, i) => (
                    <div key={i} className="bg-card border border-primary/20 p-6 rounded-lg hover:border-primary transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-primary text-sm font-mono">{item.type}</span>
                            <span className="text-gray-400 text-xs">{item.date}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{item.title}</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                        <div className="mt-6">
                            <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-bold border border-primary/20 rounded hover:bg-primary hover:text-black transition-all cursor-pointer">Register</span>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
}
