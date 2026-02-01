import { getClientsOverview } from '@/lib/clients';
import ClientsTable from '@/components/ClientsTable';
import Aurora from '@/components/Aurora';
import Orb from '@/components/Orb';
import AddClientButton from '@/components/AddClientButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const clients = await getClientsOverview();

  return (
    <div className="min-h-screen bg-[#0c0c0c] relative overflow-hidden">
      {/* Aurora Background Animation */}
      <Aurora colorStops={['#5d275d', '#5d2741', '#5d275d']} blend={1} amplitude={0.5} speed={1.5} />
      
      {/* Massive Glowing Orb - HUGE and BLURRED */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[1400px] h-[1400px] relative blur-xl opacity-60">
          <Orb hue={260} hoverIntensity={0.5} rotateOnHover={true} forceHoverState={false} />
        </div>
      </div>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#f4f4f4] mb-3 tracking-tight" style={{ fontFamily: 'Clash Display, sans-serif', lineHeight: '0.9' }}>
                Client Management
              </h1>
              <p className="text-[#bdbdbd] text-lg" style={{ fontFamily: 'Inria Sans, sans-serif' }}>
                Manage your clients, projects, and tasks in one place
              </p>
            </div>
            <div className="flex gap-3">
              <AddClientButton />
            </div>
          </div>
          
          {/* Stats Cards - BLACK/GRAY/WHITE ONLY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1" style={{ fontFamily: 'Inria Sans, sans-serif' }}>Total Clients</p>
                  <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Clash Display, sans-serif' }}>{clients.length}</p>
                </div>
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1" style={{ fontFamily: 'Inria Sans, sans-serif' }}>Active Clients</p>
                  <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                    {clients.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1" style={{ fontFamily: 'Inria Sans, sans-serif' }}>Total Budget</p>
                  <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                    ${clients.reduce((sum, c) => sum + c.total_budget, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <ClientsTable clients={clients} />
      </main>
    </div>
  );
}
