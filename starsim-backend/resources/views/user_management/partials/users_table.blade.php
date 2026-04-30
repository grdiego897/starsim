<div>
    <div class="flex justify-between items-center mb-6 border-b border-gray-700/50 pb-3">
        <h3 class="text-xl font-bold text-white">Gestión de Usuarios</h3>
        <button id="btnShowCreateUser" class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Crear nuevo usuario
        </button>
    </div>

    <div class="overflow-hidden rounded-lg border border-gray-800 bg-[#111318]">
        <table class="w-full text-left text-sm text-gray-400">
            <thead class="text-xs uppercase bg-[#16181d] text-gray-400 border-b border-gray-800">
                <tr>
                    <th scope="col" class="px-6 py-4 font-semibold">Username</th>
                    <th scope="col" class="px-6 py-4 font-semibold">Entidad</th>
                    <th scope="col" class="px-6 py-4 font-semibold">Rol</th>
                    <th scope="col" class="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
            </thead>
            <tbody id="usersTableBody" class="divide-y divide-gray-800">
                <!-- Data will be populated here via JS or Blade foreach -->
                @forelse($users ?? [] as $user)
                <tr class="hover:bg-[#1a1c23] transition-colors group">
                    <td class="px-6 py-4 font-medium text-gray-200">{{ $user->username }}</td>
                    <td class="px-6 py-4">{{ $user->entidad }}</td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                            {{ $user->role === 'Admin' ? 'bg-purple-900/30 text-purple-400 border-purple-800/50' : 
                               ($user->role === 'Operator' ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-gray-800 text-gray-300 border-gray-700') }}">
                            {{ $user->role }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <!-- El admin no puede eliminarse a sí mismo -->
                        @if(auth()->user() && auth()->user()->id !== $user->id)
                        <button class="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100 btn-delete-user" 
                                data-id="{{ $user->id }}" data-username="{{ $user->username }}" title="Eliminar usuario">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        @endif
                    </td>
                </tr>
                @empty
                <tr id="emptyUsersRow">
                    <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                        <div class="flex flex-col items-center justify-center">
                            <svg class="w-8 h-8 mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            <p>Cargando usuarios o no hay usuarios registrados.</p>
                        </div>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
