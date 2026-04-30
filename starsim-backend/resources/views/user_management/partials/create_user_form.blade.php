<div>
    <div class="flex items-center gap-3 mb-6 border-b border-gray-700/50 pb-3">
        <button id="btnBackToUsers" class="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <h3 class="text-xl font-bold text-white">Crear Nuevo Usuario</h3>
    </div>

    <form id="createUserForm" class="space-y-5 max-w-md">
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">Nombre de Usuario</label>
            <input type="text" id="newUsername" name="username" 
                   class="w-full bg-[#111318] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" required>
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">Entidad</label>
            <input type="text" id="newEntity" name="entidad" 
                   class="w-full bg-[#111318] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" required>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">Rol</label>
            <div class="relative">
                <select id="newRole" name="role" 
                        class="w-full bg-[#111318] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer" required>
                    <option value="" disabled selected>Selecciona un rol</option>
                    <option value="Admin">Admin</option>
                    <option value="Operator">Operator</option>
                    <option value="Viewer">Viewer</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
                <input type="password" id="newPassword" name="password" 
                       class="w-full bg-[#111318] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-300 mb-1.5">Confirmar Contraseña</label>
                <input type="password" id="newPasswordConfirm" name="password_confirmation" 
                       class="w-full bg-[#111318] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" required>
            </div>
        </div>

        <div class="pt-4">
            <button type="submit" id="btnSubmitCreateUser" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
                <span class="btn-text">Registrar Usuario</span>
                <svg class="w-4 h-4 hidden spinner animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </button>
        </div>
    </form>
</div>
