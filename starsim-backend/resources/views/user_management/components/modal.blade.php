<div id="userManagementModal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <!-- Modal Panel -->
    <div class="relative bg-[#161616] rounded-3xl text-left shadow-2xl transform transition-all w-[90%] max-w-4xl h-[80vh] min-h-[500px] border border-gray-800 flex flex-col md:flex-row overflow-hidden">
        
        <!-- Botón Cerrar (Top Right Absoluto) -->
        <button id="closeModalBtn" class="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-[#1f1f1f] hover:bg-[#2f2f2f] p-2 rounded-full z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <!-- Sidebar -->
        <div class="w-full md:w-64 bg-[#161616] p-6 pr-2 flex flex-col border-r border-gray-800">
            <h2 class="text-xl font-bold text-white mb-6 pl-3">Configuración</h2>
            
            <nav class="space-y-1 flex-1 pr-4">
                <button id="tab-profile" class="w-full text-left px-4 py-2.5 rounded-full text-sm font-medium transition-colors bg-[#2d2d2d] text-white flex items-center gap-3">
                    <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Mi perfil
                </button>
                
                @if(auth()->check() && auth()->user()->role === 'Admin')
                <button id="tab-users" class="w-full text-left px-4 py-2.5 rounded-full text-sm font-medium text-gray-400 hover:bg-[#1f1f1f] hover:text-white transition-colors flex items-center gap-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Usuarios
                </button>
                @endif
            </nav>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 bg-[#161616] p-8 md:p-10 overflow-y-auto mt-12 md:mt-0">
            <!-- Tab: Mi Perfil -->
            <div id="content-profile" class="tab-content h-full">
                @include('user_management.partials.profile_form')
            </div>

            @if(auth()->check() && auth()->user()->role === 'Admin')
            <!-- Tab: Usuarios -->
            <div id="content-users" class="tab-content hidden h-full">
                @include('user_management.partials.users_table')
            </div>
            
            <!-- Sub-Tab: Crear Usuario -->
            <div id="content-create-user" class="tab-content hidden h-full">
                @include('user_management.partials.create_user_form')
            </div>
            @endif
        </div>
        
    </div>
</div>

<!-- Componente Toast para Notificaciones -->
<div id="toastContainer" class="fixed bottom-5 right-5 z-[60] flex flex-col gap-2"></div>
