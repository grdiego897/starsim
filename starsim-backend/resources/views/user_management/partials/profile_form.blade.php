<div class="h-full flex flex-col">
    <!-- Header -->
    <div class="mb-8">
        <h3 class="text-xl font-bold text-white mb-1">Account</h3>
        <p class="text-sm text-gray-400">Manage your account settings and preferences.</p>
    </div>

    <!-- Lista de ajustes -->
    <div class="space-y-6 max-w-2xl">
        
        <!-- Row: Perfil / Username -->
        <div class="flex items-center justify-between group">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                    <img src="{{ asset('img/avatar.jpg') }}" alt="Avatar" class="w-full h-full object-cover">
                </div>
                <div>
                    <h4 class="text-base font-semibold text-white">{{ auth()->user()->username ?? 'Usuario' }}</h4>
                    <p class="text-sm text-gray-400">{{ auth()->user()->entidad ?? 'Sin entidad' }}</p>
                </div>
            </div>
            <button class="px-4 py-1.5 rounded-full border border-gray-700 text-sm font-medium text-white hover:bg-[#2d2d2d] transition-colors">
                Manage
            </button>
        </div>

        <!-- Opciones adicionales (estilo lista) -->
        <div class="space-y-1">
            <!-- Row: Cambiar Username -->
            <div class="flex items-center justify-between py-3 group">
                <div class="flex items-center gap-4">
                    <div class="w-6 flex justify-center text-gray-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <span class="text-sm font-medium text-gray-200">Username</span>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-sm text-gray-500">{{ auth()->user()->username ?? '' }}</span>
                    <button class="px-4 py-1.5 rounded-full border border-gray-700 text-sm font-medium text-white hover:bg-[#2d2d2d] transition-colors">
                        Change
                    </button>
                </div>
            </div>

            <!-- Row: Cambiar Contraseña -->
            <div class="flex items-center justify-between py-3 group">
                <div class="flex items-center gap-4">
                    <div class="w-6 flex justify-center text-gray-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                    </div>
                    <span class="text-sm font-medium text-gray-200">Password</span>
                </div>
                <button class="px-4 py-1.5 rounded-full border border-gray-700 text-sm font-medium text-white hover:bg-[#2d2d2d] transition-colors">
                    Update
                </button>
            </div>
            
            <!-- Row: Rol (Solo Lectura) -->
            <div class="flex items-center justify-between py-3 group">
                <div class="flex items-center gap-4">
                    <div class="w-6 flex justify-center text-gray-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <span class="text-sm font-medium text-gray-200">Role</span>
                </div>
                <span class="text-sm text-gray-500">{{ auth()->user()->role ?? 'Unknown' }}</span>
            </div>
        </div>
    </div>
    
    <!-- Texto de relleno en la parte inferior -->
    <div class="mt-auto pt-8">
        <p class="text-xs text-gray-600">StarSim UUID: {{ auth()->user()->id ?? 'N/A' }}</p>
    </div>
</div>
