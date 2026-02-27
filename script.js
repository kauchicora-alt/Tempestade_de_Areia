// ============================================
// PWA - PROGRESSIVE WEB APP - CONFIGURAÇÃO
// ============================================
let deferredPrompt = null;
let isIOSPWA = false;
let isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);

function setupPWA() {
    // Detecta se é um app PWA no iOS
    isIOSPWA = window.navigator.standalone === true;
    
    const installBanner = document.getElementById('install-banner');
    const installBtn = document.getElementById('install-btn');
    const dismissBtn = document.getElementById('dismiss-banner');

    console.log('[PWA] iOS Device:', isIOSDevice);
    console.log('[PWA] iOS PWA:', isIOSPWA);
    console.log('[PWA] Standalone:', window.navigator.standalone);

    // Detecta quando o navegador quer mostrar o botão de instalar (não funciona no iOS)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (!isIOSDevice) {
            installBanner.classList.remove('hidden');
            console.log('[PWA] beforeinstallprompt capturado');
        }
    });

    // Botão para instalar (Android/Desktop)
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`[PWA] Usuário respondeu: ${outcome}`);
                deferredPrompt = null;
                installBanner.classList.add('hidden');
            } else if (isIOSDevice) {
                // Instrução manual para iOS
                alert('No iOS, toque o botão Compartilhar e selecione "Adicionar à Tela Inicial"');
                console.log('[PWA] Instruções iOS mostradas');
            }
        });
    }

    // Fechar o banner
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            installBanner.classList.add('hidden');
        });
    }

    // Detecta quando o app foi instalado
    window.addEventListener('appinstalled', () => {
        console.log('[PWA] ✅ App instalado com sucesso!');
        deferredPrompt = null;
        installBanner.classList.add('hidden');
    });

    // Mostrar banner no iOS se não está instalado como PWA
    if (isIOSDevice && !isIOSPWA) {
        setTimeout(() => {
            installBanner.classList.remove('hidden');
            installBtn.textContent = '📱 Ver instruções';
        }, 2000);
    }

    // Registrar Service Worker com mais detalhes
    if ('serviceWorker' in navigator) {
        console.log('[PWA] Service Worker suportado');
        navigator.serviceWorker.ready.then(registration => {
            console.log('[PWA] Service Worker está pronto:', registration);
        });
        
        navigator.serviceWorker.register('./service-worker.js', {
            scope: './'
        }).then(registration => {
            console.log('[PWA] ✅ Service Worker registrado:', registration.scope);
            
            // Verificar atualizações
            registration.onupdatefound = () => {
                const newWorker = registration.installing;
                console.log('[PWA] Novo Service Worker encontrado');
                
                newWorker.onstatechange = () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('[PWA] Atualização disponível!');
                    }
                };
            };
        }).catch(error => {
            console.log('[PWA] ❌ Erro ao registrar Service Worker:', error);
        });
    } else {
        console.log('[PWA] ⚠️ Service Worker não suportado neste navegador');
    }
}

// ============================================
// FUNÇÕES DE RENDERIZAÇÃO
// ============================================
function renderPericias() {
    const pericias = [
        { nome: 'Acrobacia', attr: 'destreza' },
        { nome: 'Arcanismo', attr: 'inteligencia' },
        { nome: 'Atletismo', attr: 'forca' },
        { nome: 'Enganação', attr: 'carisma' },
        { nome: 'História', attr: 'inteligencia' },
        { nome: 'Intimidação', attr: 'carisma' },
        { nome: 'Intuição', attr: 'sabedoria' },
        { nome: 'Investigação', attr: 'inteligencia' },
        { nome: 'Lidar com Animais', attr: 'sabedoria' },
        { nome: 'Medicina', attr: 'sabedoria' },
        { nome: 'Natureza', attr: 'inteligencia' },
        { nome: 'Percepção', attr: 'sabedoria' },
        { nome: 'Persuasão', attr: 'carisma' },
        { nome: 'Prestidigitação', attr: 'destreza' },
        { nome: 'Religião', attr: 'inteligencia' },
        { nome: 'Sobrevivência', attr: 'sabedoria' }
    ];
    return `
        <div class="p-6 arcane-box mt-6">
            <h2 class="text-xl font-bold text-secondary-500 mb-4">📊 Perícias</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                ${pericias.map(p => {
                    const mod = Math.floor((fichaKael.atributos[p.attr] - 10) / 2);
                    const pericia = fichaKael.pericias[p.nome] !== undefined ? fichaKael.pericias[p.nome] : mod;
                    return `<div class="arcane-box p-3">
                        <span class="text-secondary-500 font-bold text-sm">${p.nome}</span>
                        <input type="number" class="pericia-input w-full bg-dark-700 text-amber-400 font-bold mt-2 px-2 py-1 rounded text-center" 
                            data-pericia="${p.nome}" value="${pericia}" placeholder="${mod >= 0 ? '+' : ''}${mod}">
                    </div>`;
                }).join('')}
            </div>
        </div>
    `;
}
// Objeto principal vazio para cada jogador preencher
const fichaKael = {
    cabecalho: {
        nomePersonagem: "",
        classeNivel: "",
        raca: "",
        antecedente: "",
        tendencia: "",
        aparencia: ""
    },
    atributos: {
        forca: 10, destreza: 10, constituicao: 10,
        inteligencia: 10, sabedoria: 10, carisma: 10,
        proficiencia: 0
    },
    pericias: {
        'Acrobacia': undefined,
        'Arcanismo': undefined,
        'Atletismo': undefined,
        'Enganação': undefined,
        'História': undefined,
        'Intimidação': undefined,
        'Intuição': undefined,
        'Investigação': undefined,
        'Lidar com Animais': undefined,
        'Medicina': undefined,
        'Natureza': undefined,
        'Percepção': undefined,
        'Persuasão': undefined,
        'Prestidigitação': undefined,
        'Religião': undefined,
        'Sobrevivência': undefined
    },
    proficiencias: {
        armaduras: [],
        armas: [],
        ferramentas: [],
        idiomas: []
    },
    caracteristicas: [],
    talentos: [],
    aliados: [],
    combate: {
        ca: 10, iniciativa: 0, deslocamento: 9,
        vidaMaxima: 0, vidaAtual: 0,
        ataques: []
    },
    magias: {
        slots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        slotsGastos: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        lista: []
    },
    historia: "",
    inventario: "",
    anotacoes: ""
};

// Funções de Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupPWA();
    carregarFicha();
    configurarAbas();
});

function carregarFicha() {
    const salvos = localStorage.getItem('fichaKael');
    if (salvos) Object.assign(fichaKael, JSON.parse(salvos));
    
    // Preenche o cabeçalho de forma segura
    const nome = document.getElementById('nomePersonagem');
    if (nome) {
        nome.value = fichaKael.cabecalho.nomePersonagem;
        nome.addEventListener('input', (e) => {
            fichaKael.cabecalho.nomePersonagem = e.target.value;
            localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
        });
    }
    
    const classe = document.getElementById('classeNivel');
    if (classe) {
        classe.value = fichaKael.cabecalho.classeNivel;
        classe.addEventListener('input', (e) => {
            fichaKael.cabecalho.classeNivel = e.target.value;
            localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
        });
    }
    
    const raca = document.getElementById('raca');
    if (raca) {
        raca.value = fichaKael.cabecalho.raca;
        raca.addEventListener('input', (e) => {
            fichaKael.cabecalho.raca = e.target.value;
            localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
        });
    }
    
    const antecedente = document.getElementById('antecedente');
    if (antecedente) {
        antecedente.value = fichaKael.cabecalho.antecedente;
        antecedente.addEventListener('input', (e) => {
            fichaKael.cabecalho.antecedente = e.target.value;
            localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
        });
    }
    
    const tendencia = document.getElementById('tendencia');
    if (tendencia) {
        tendencia.value = fichaKael.cabecalho.tendencia;
        tendencia.addEventListener('input', (e) => {
            fichaKael.cabecalho.tendencia = e.target.value;
            localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
        });
    }
    
    const aparencia = document.getElementById('aparencia');
    if (aparencia) {
        aparencia.value = fichaKael.cabecalho.aparencia;
        aparencia.addEventListener('input', (e) => {
            fichaKael.cabecalho.aparencia = e.target.value;
            localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
        });
    }

    carregarAba('inicio'); // Tela inicial
}

function configurarAbas() {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => carregarAba(btn.getAttribute('data-tab')));
    });
}

function carregarAba(aba) {
    const container = document.getElementById('tab-content');
    if (!container) {
        alert('Erro: container de abas não encontrado!');
        return;
    }

    // Atualiza botões
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active', 'border-primary-500', 'text-secondary-500'));
    const btnAtivo = document.querySelector(`[data-tab="${aba}"]`);
    if (btnAtivo) btnAtivo.classList.add('active', 'border-primary-500', 'text-secondary-500');

    // Renderiza conteúdo
    if (aba === 'inicio') {
        container.innerHTML = renderCabecalho() + renderPericias();
        document.querySelectorAll('.atributo-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const attr = e.target.getAttribute('data-atributo');
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 1;
                if (val < 1) val = 1;
                if (val > 30) val = 30;
                fichaKael.atributos[attr] = val;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('inicio');
            });
        });
        
        // Listeners para perícias
        document.querySelectorAll('.pericia-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const pericia = e.target.getAttribute('data-pericia');
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = undefined;
                fichaKael.pericias[pericia] = val || undefined;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('inicio');
            });
        });
    } else if (aba === 'combate') {
        container.innerHTML = renderCombate();
        const vidaAtualInput = document.getElementById('vidaAtualInput');
        const vidaMaximaInput = document.getElementById('vidaMaximaInput');
        if (vidaAtualInput) {
            vidaAtualInput.addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 0) val = 0;
                if (val > fichaKael.combate.vidaMaxima) val = fichaKael.combate.vidaMaxima;
                fichaKael.combate.vidaAtual = val;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('combate');
            });
        }
        if (vidaMaximaInput) {
            vidaMaximaInput.addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 1) val = 1;
                fichaKael.combate.vidaMaxima = val;
                if (fichaKael.combate.vidaAtual > val) fichaKael.combate.vidaAtual = val;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('combate');
            });
        }
        
        // Listeners para CA, Iniciativa e Deslocamento
        const caInput = document.getElementById('caInput');
        if (caInput) {
            caInput.addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 10;
                fichaKael.combate.ca = val;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
            });
        }
        
        const iniciatvaInput = document.getElementById('iniciatvaInput');
        if (iniciatvaInput) {
            iniciatvaInput.addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 0;
                fichaKael.combate.iniciativa = val;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
            });
        }
        
        const deslocInput = document.getElementById('deslocInput');
        if (deslocInput) {
            deslocInput.addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 0) val = 9;
                fichaKael.combate.deslocamento = val;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
            });
        }
        
        // Event listeners para ataques
        document.querySelectorAll('.ataque-input').forEach(input => {
            input.addEventListener('change', () => {
                const idx = parseInt(input.getAttribute('data-idx'));
                const campo = input.getAttribute('data-campo');
                let val = input.value;
                if (campo === 'bonus') val = parseInt(val);
                fichaKael.combate.ataques[idx][campo] = val;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('combate');
            });
        });
        // Botão para adicionar ataque
        const btnAddAtaque = document.getElementById('btn-add-ataque');
        if (btnAddAtaque) {
            btnAddAtaque.addEventListener('click', () => {
                fichaKael.combate.ataques.push({ nome: 'Novo Ataque', bonus: 0, dano: '1d8', tipo: 'Melee' });
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('combate');
            });
        }
    } else if (aba === 'magias') {
        container.innerHTML = renderMagias();
        // Event listeners para magias
        document.querySelectorAll('.magia-input').forEach(input => {
            input.addEventListener('change', () => {
                const idx = parseInt(input.getAttribute('data-idx'));
                const campo = input.getAttribute('data-campo');
                fichaKael.magias.lista[idx][campo] = input.value;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('magias');
            });
        });
        
        // Botão para adicionar magia
        const btnAddMagia = document.getElementById('btn-add-magia');
        if (btnAddMagia) {
            btnAddMagia.addEventListener('click', () => {
                const nomeMagia = document.getElementById('novamagiaInput')?.value.trim();
                const circulo = document.getElementById('novamagiaCirculo')?.value;
                const descMagia = document.getElementById('novamagiaDesc')?.value.trim();
                
                if (!nomeMagia || !circulo) {
                    alert('Preencha o nome da magia e selecione o círculo!');
                    return;
                }
                
                fichaKael.magias.lista.push({ 
                    nivel: parseInt(circulo), 
                    nome: nomeMagia, 
                    desc: descMagia || 'Digite a descrição da magia aqui...' 
                });
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                
                // Limpa os campos
                document.getElementById('novamagiaInput').value = '';
                document.getElementById('novamagiaCirculo').value = '';
                document.getElementById('novamagiaDesc').value = '';
                
                carregarAba('magias');
            });
        }
    } else if (aba === 'proficiencias') {
        container.innerHTML = renderProficiencias();
        // Event listeners para proficiências
        document.querySelectorAll('.prof-input').forEach(input => {
            input.addEventListener('change', () => {
                const tipo = input.getAttribute('data-tipo');
                const idx = parseInt(input.getAttribute('data-idx'));
                fichaKael.proficiencias[tipo][idx] = input.value;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('proficiencias');
            });
        });
        // Botões de adicionar para cada tipo
        document.querySelectorAll('.btn-add-prof').forEach(btn => {
            btn.addEventListener('click', () => {
                const tipo = btn.getAttribute('data-tipo');
                fichaKael.proficiencias[tipo].push('Nova ' + tipo);
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('proficiencias');
            });
        });
    } else if (aba === 'caracteristicas') {
        container.innerHTML = renderCaracteristicas();
        // Event listeners para características
        document.querySelectorAll('.car-input').forEach(input => {
            input.addEventListener('change', () => {
                const idx = parseInt(input.getAttribute('data-idx'));
                const campo = input.getAttribute('data-campo');
                fichaKael.caracteristicas[idx][campo] = input.value;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('caracteristicas');
            });
        });
        // Botão para adicionar característica
        const btnAddCar = document.getElementById('btn-add-caracteristica');
        if (btnAddCar) {
            btnAddCar.addEventListener('click', () => {
                fichaKael.caracteristicas.push({ titulo: 'Nova Característica', desc: 'Digite a descrição aqui...' });
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('caracteristicas');
            });
        }
    } else if (aba === 'talentos') {
        container.innerHTML = renderTalentos();
        // Event listeners para talentos
        document.querySelectorAll('.tal-input').forEach(input => {
            input.addEventListener('change', () => {
                const idx = parseInt(input.getAttribute('data-idx'));
                const campo = input.getAttribute('data-campo');
                fichaKael.talentos[idx][campo] = input.value;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('talentos');
            });
        });
        // Botão para adicionar talento
        const btnAddTal = document.getElementById('btn-add-talento');
        if (btnAddTal) {
            btnAddTal.addEventListener('click', () => {
                fichaKael.talentos.push({ titulo: 'Novo Talento', desc: 'Digite a descrição aqui...' });
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('talentos');
            });
        }
    } else if (aba === 'aliados') {
        container.innerHTML = renderAliados();
        // Event listeners para aliados
        document.querySelectorAll('.ali-input').forEach(input => {
            input.addEventListener('change', () => {
                const idx = parseInt(input.getAttribute('data-idx'));
                const campo = input.getAttribute('data-campo');
                fichaKael.aliados[idx][campo] = input.value;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('aliados');
            });
        });
        // Botão para adicionar aliado
        const btnAddAli = document.getElementById('btn-add-aliado');
        if (btnAddAli) {
            btnAddAli.addEventListener('click', () => {
                fichaKael.aliados.push({ nome: 'Novo Aliado', relacao: 'Digite a relação aqui...' });
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
                carregarAba('aliados');
            });
        }
    } else if (aba === 'inventario') {
        container.innerHTML = renderInventario();
        const inventarioInput = document.getElementById('inventarioInput');
        if (inventarioInput) {
            inventarioInput.value = fichaKael.inventario || '';
            inventarioInput.addEventListener('input', (e) => {
                fichaKael.inventario = e.target.value;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
            });
        }
    } else if (aba === 'anotacoes') {
        container.innerHTML = renderAnotacoes();
        const anotacoesInput = document.getElementById('anotacoesInput');
        if (anotacoesInput) {
            anotacoesInput.value = fichaKael.anotacoes || '';
            anotacoesInput.addEventListener('input', (e) => {
                fichaKael.anotacoes = e.target.value;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
            });
        }
    } else if (aba === 'historia') {
        container.innerHTML = renderHistoria();
        const historiaInput = document.getElementById('historiaInput');
        if (historiaInput) {
            historiaInput.value = fichaKael.historia || '';
            historiaInput.addEventListener('input', (e) => {
                fichaKael.historia = e.target.value;
                localStorage.setItem('fichaKael', JSON.stringify(fichaKael));
            });
        }
    } else {
        container.innerHTML = `<div class="p-10 text-center text-gray-500 italic">Tela não encontrada.</div>`;
    }
}

// Renderiza o cabeçalho principal COM atributos
function renderCabecalho() {
    const c = fichaKael.cabecalho;
    const a = fichaKael.atributos;
    const attrNames = ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'];
    return `
        <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
            ${attrNames.map(attr => {
                const val = a[attr];
                const mod = Math.floor((val - 10) / 2);
                return `
                <div class="attr-box">
                    <div class="attr-label">${attr.substring(0, 3)}</div>
                    <input type="number" min="1" max="30" value="${val}" data-atributo="${attr}" class="atributo-input attr-value text-center w-full" />
                    <div class="attr-modifier">${mod >= 0 ? '+' : ''}${mod}</div>
                </div>
            `}).join('')}
        </div>
    `;
}

// Render Perícias
function renderCombate() {
    const c = fichaKael.combate;
    return `
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="arcane-box p-6">
                <h2 class="text-2xl font-bold text-secondary-500 mb-6">⚔️ Status de Combate</h2>
                <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="arcane-box p-4 text-center">
                        <div class="text-gray-400 text-sm font-bold mb-2">CA</div>
                        <input type="number" id="caInput" min="0" max="30" value="${c.ca}" class="w-full text-center text-2xl font-bold text-amber-400 bg-dark-700 rounded px-2 py-1 focus:outline-none border border-amber-400/50 focus:border-amber-400" />
                    </div>
                    <div class="arcane-box p-4 text-center">
                        <div class="text-gray-400 text-sm font-bold mb-2">INICIATIVA</div>
                        <input type="number" id="iniciatvaInput" value="${c.iniciativa}" class="w-full text-center text-2xl font-bold text-cyan-400 bg-dark-700 rounded px-2 py-1 focus:outline-none border border-cyan-400/50 focus:border-cyan-400" />
                    </div>
                    <div class="arcane-box p-4 text-center">
                        <div class="text-gray-400 text-sm font-bold mb-2">DESLOC.</div>
                        <input type="number" id="deslocInput" min="0" max="60" value="${c.deslocamento}" class="w-full text-center text-2xl font-bold text-violet-400 bg-dark-700 rounded px-2 py-1 focus:outline-none border border-violet-400/50 focus:border-violet-400" />
                        <div class="text-gray-400 text-xs">metros</div>
                    </div>
                </div>
                
                <div class="arcane-box p-4 mb-4">
                    <label class="block text-secondary-500 font-bold mb-3">💚 Pontos de Vida</label>
                    <div class="flex items-center gap-3">
                        <input type="number" min="0" max="${c.vidaMaxima}" value="${c.vidaAtual}" id="vidaAtualInput" class="w-20 text-center font-bold bg-dark-700 rounded px-2 py-1" />
                        <span class="text-gray-400">/</span>
                        <input type="number" min="1" max="999" value="${c.vidaMaxima}" id="vidaMaximaInput" class="w-20 text-center font-bold bg-dark-700 rounded px-2 py-1" />
                    </div>
                    <div class="mt-3 h-6 bg-dark-700 rounded border border-red-500/50 overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-red-600 to-orange-500" style="width: ${(c.vidaAtual / c.vidaMaxima * 100)}%"></div>
                    </div>
                </div>
            </div>
            
            <div class="arcane-box p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-secondary-500">⚡ Ataques</h2>
                    <button id="btn-add-ataque" class="bg-red-600/30 hover:bg-red-600/50 text-red-400 px-4 py-2 rounded text-sm font-bold transition">+ Adicionar</button>
                </div>
                <div class="space-y-3">
                    ${c.ataques.map((a, idx) => `
                        <div class="arcane-box p-4 border-l-4 border-l-red-500">
                            <input type="text" value="${a.nome}" data-idx="${idx}" data-campo="nome" class="ataque-input font-bold text-gray-100 bg-transparent border-b-2 border-red-500 pb-1 w-full focus:outline-none" />
                            <div class="grid grid-cols-3 gap-2 mt-2 text-xs">
                                <div>
                                    <span class="text-gray-400">Bônus</span>
                                    <input type="number" value="${a.bonus}" data-idx="${idx}" data-campo="bonus" class="ataque-input w-full text-cyan-400 font-bold bg-transparent border-b border-cyan-400 focus:outline-none" />
                                </div>
                                <div>
                                    <span class="text-gray-400">Dano</span>
                                    <input type="text" value="${a.dano}" data-idx="${idx}" data-campo="dano" class="ataque-input w-full text-amber-400 font-bold bg-transparent border-b border-amber-400 focus:outline-none" />
                                </div>
                                <div>
                                    <span class="text-gray-400">Tipo</span>
                                    <input type="text" value="${a.tipo}" data-idx="${idx}" data-campo="tipo" class="ataque-input w-full text-red-400 font-bold bg-transparent border-b border-red-400 focus:outline-none" />
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Render Inventário
function renderInventario() {
    return `
        <div class="p-6 bg-dark-800 rounded-lg border border-dark-700">
            <h2 class="text-xl font-bold text-primary-500 mb-4">Inventário</h2>
            <textarea id="inventarioInput" rows="8" class="w-full bg-dark-700 rounded px-3 py-2 text-gray-100 focus:outline-none" placeholder="Digite seu inventário aqui..."></textarea>
        </div>
    `;
}

// Render Anotações
function renderAnotacoes() {
    return `
        <div class="p-6 bg-dark-800 rounded-lg border border-dark-700">
            <h2 class="text-xl font-bold text-primary-500 mb-4">Anotações</h2>
            <textarea id="anotacoesInput" rows="8" class="w-full bg-dark-700 rounded px-3 py-2 text-gray-100 focus:outline-none" placeholder="Digite suas anotações aqui..."></textarea>
        </div>
    `;
}

// Render Proficiências
function renderProficiencias() {
    const p = fichaKael.proficiencias;
    return `
        <div class="p-6 space-y-6">
            <div class="arcane-box p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-bold text-secondary-500">🛡️ Armaduras</h2>
                    <button class="btn-add-prof bg-amber-600/30 hover:bg-amber-600/50 text-amber-400 px-3 py-1 rounded text-sm font-bold transition" data-tipo="armaduras">+ Adicionar</button>
                </div>
                <div class="space-y-2">
                    ${p.armaduras.map((a, idx) => `
                        <input type="text" value="${a}" data-tipo="armaduras" data-idx="${idx}" class="prof-input w-full bg-dark-700 rounded px-3 py-2 text-gray-100 focus:outline-none border border-dark-600 focus:border-amber-400" />
                    `).join('')}
                </div>
            </div>
            
            <div class="arcane-box p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-bold text-secondary-500">⚔️ Armas</h2>
                    <button class="btn-add-prof bg-red-600/30 hover:bg-red-600/50 text-red-400 px-3 py-1 rounded text-sm font-bold transition" data-tipo="armas">+ Adicionar</button>
                </div>
                <div class="space-y-2">
                    ${p.armas.map((a, idx) => `
                        <input type="text" value="${a}" data-tipo="armas" data-idx="${idx}" class="prof-input w-full bg-dark-700 rounded px-3 py-2 text-gray-100 focus:outline-none border border-dark-600 focus:border-red-400" />
                    `).join('')}
                </div>
            </div>
            
            <div class="arcane-box p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-bold text-secondary-500">🔧 Ferramentas</h2>
                    <button class="btn-add-prof bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-400 px-3 py-1 rounded text-sm font-bold transition" data-tipo="ferramentas">+ Adicionar</button>
                </div>
                <div class="space-y-2">
                    ${p.ferramentas.map((f, idx) => `
                        <input type="text" value="${f}" data-tipo="ferramentas" data-idx="${idx}" class="prof-input w-full bg-dark-700 rounded px-3 py-2 text-gray-100 focus:outline-none border border-dark-600 focus:border-cyan-400" />
                    `).join('')}
                </div>
            </div>
            
            <div class="arcane-box p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-bold text-secondary-500">🗣️ Idiomas</h2>
                    <button class="btn-add-prof bg-violet-600/30 hover:bg-violet-600/50 text-violet-400 px-3 py-1 rounded text-sm font-bold transition" data-tipo="idiomas">+ Adicionar</button>
                </div>
                <div class="space-y-2">
                    ${p.idiomas.map((i, idx) => `
                        <input type="text" value="${i}" data-tipo="idiomas" data-idx="${idx}" class="prof-input w-full bg-dark-700 rounded px-3 py-2 text-gray-100 focus:outline-none border border-dark-600 focus:border-violet-400" />
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Render Características
function renderCaracteristicas() {
    const c = fichaKael.caracteristicas;
    return `
        <div class="p-6 space-y-4">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-secondary-500">✨ Características</h2>
                <button id="btn-add-caracteristica" class="bg-secondary-500/30 hover:bg-secondary-500/50 text-secondary-400 px-4 py-2 rounded text-sm font-bold transition">+ Adicionar Característica</button>
            </div>
            ${c.map((car, idx) => `
                <div class="arcane-box p-6">
                    <input type="text" value="${car.titulo}" data-idx="${idx}" data-campo="titulo" class="car-input text-lg font-bold text-secondary-500 bg-transparent border-b-2 border-secondary-500 pb-2 w-full mb-3 focus:outline-none" />
                    <textarea data-idx="${idx}" data-campo="desc" class="car-input w-full bg-dark-700 rounded px-3 py-2 text-gray-100 focus:outline-none border border-dark-600 focus:border-secondary-400 min-h-20">${car.desc}</textarea>
                </div>
            `).join('')}
        </div>
    `;
}

// Render Talentos
function renderTalentos() {
    const t = fichaKael.talentos;
    return `
        <div class="p-6 space-y-4">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-secondary-500">⭐ Talentos</h2>
                <button id="btn-add-talento" class="bg-amber-600/30 hover:bg-amber-600/50 text-amber-400 px-4 py-2 rounded text-sm font-bold transition">+ Adicionar Talento</button>
            </div>
            ${t.map((tal, idx) => `
                <div class="arcane-box p-6 border-l-4 border-l-secondary-500">
                    <input type="text" value="${tal.titulo}" data-idx="${idx}" data-campo="titulo" class="tal-input text-lg font-bold text-secondary-500 bg-transparent border-b-2 border-secondary-500 pb-2 w-full mb-3 focus:outline-none" />
                    <textarea data-idx="${idx}" data-campo="desc" class="tal-input w-full bg-dark-700 rounded px-3 py-2 text-gray-100 focus:outline-none border border-dark-600 focus:border-amber-400 min-h-20">${tal.desc}</textarea>
                </div>
            `).join('')}
        </div>
    `;
}

// Render Aliados
function renderAliados() {
    const al = fichaKael.aliados;
    return `
        <div class="p-6 space-y-4">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-secondary-500">👥 Aliados & Contatos</h2>
                <button id="btn-add-aliado" class="bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-400 px-4 py-2 rounded text-sm font-bold transition">+ Adicionar Aliado</button>
            </div>
            ${al.map((a, idx) => `
                <div class="arcane-box p-6">
                    <input type="text" value="${a.nome}" data-idx="${idx}" data-campo="nome" class="ali-input text-lg font-bold text-gray-100 bg-transparent border-b-2 border-secondary-500 pb-2 w-full mb-2 focus:outline-none" />
                    <input type="text" value="${a.relacao}" data-idx="${idx}" data-campo="relacao" class="ali-input text-secondary-500 text-sm font-semibold bg-transparent border-b-2 border-secondary-500 pb-2 w-full focus:outline-none" />
                </div>
            `).join('')}
        </div>
    `;
}

// Renderizadores de HTML
function renderAtributos() {
    return `
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            ${Object.entries(fichaKael.atributos)
                .filter(([k, v]) => typeof v === 'number')
                .map(([attr, val]) => `
                <div class="bg-dark-800 p-4 rounded-lg border border-dark-700 text-center">
                    <p class="text-secondary-500 uppercase text-xs font-bold">${attr}</p>
                    <input type="number" min="1" max="30" value="${val}" data-atributo="${attr}" class="atributo-input text-3xl font-bold bg-transparent text-center w-20 mx-auto border-b-2 border-secondary-500 focus:outline-none" />
                    <p class="text-sm text-gray-400">Mod: ${Math.floor((val - 10) / 2) >= 0 ? '+' : ''}${Math.floor((val - 10) / 2)}</p>
                </div>
            `).join('')}
        </div>`;
}

function renderMagias() {
    // Mostra todas as magias, agrupadas por nível presente na lista
    const niveis = [...new Set(fichaKael.magias.lista.map(m => m.nivel))].sort((a, b) => a - b);
    let html = `
        <div class="p-4 space-y-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-secondary-500">📖 Espaços de Magia (Slots)</h2>
            </div>
            <div class="grid grid-cols-3 gap-2 mb-6">
                ${[1, 2, 3].map(nvl => `
                    <div class="arcane-box p-3 text-center">
                        <span class="text-xs block text-gray-400 mb-1">Nível ${nvl}</span>
                        <span class="text-lg font-bold text-secondary-500">${fichaKael.magias.slots[nvl] || 0}</span>
                    </div>
                `).join('')}
            </div>

            <div class="arcane-box p-6 border-2 border-secondary-500/30">
                <h3 class="text-lg font-bold text-secondary-500 mb-4">➕ Adicionar Magia</h3>
                <div class="grid grid-cols-3 gap-3 mb-4">
                    <input type="text" id="novamagiaInput" placeholder="Nome da magia" class="bg-dark-700 rounded px-3 py-2 text-gray-100 focus:outline-none border border-dark-600 focus:border-secondary-400" />
                    <select id="novamagiaCirculo" class="bg-dark-700 rounded px-3 py-2 text-gray-100 focus:outline-none border border-dark-600 focus:border-secondary-400">
                        <option value="">Selecione o círculo</option>
                        <option value="0">⭐ Truque (0)</option>
                        <option value="1">🔮 Círculo 1</option>
                        <option value="2">🔮 Círculo 2</option>
                        <option value="3">🔮 Círculo 3</option>
                        <option value="4">🔮 Círculo 4</option>
                        <option value="5">🔮 Círculo 5</option>
                        <option value="6">🔮 Círculo 6</option>
                        <option value="7">🔮 Círculo 7</option>
                        <option value="8">🔮 Círculo 8</option>
                        <option value="9">🔮 Círculo 9</option>
                    </select>
                    <button id="btn-add-magia" class="bg-secondary-500/30 hover:bg-secondary-500/50 text-secondary-400 px-4 py-2 rounded font-bold transition">+ Adicionar</button>
                </div>
                <textarea id="novamagiaDesc" placeholder="Descrição da magia..." class="w-full bg-dark-700 rounded px-3 py-2 text-gray-100 focus:outline-none border border-dark-600 focus:border-secondary-400 min-h-20"></textarea>
            </div>

            <h2 class="text-xl font-bold text-secondary-500">🪄 Grimório Conhecido</h2>
            <div class="space-y-4 max-h-96 overflow-y-auto">
                ${niveis.length > 0 ? niveis.map(nvl => {
                    const magias = fichaKael.magias.lista.filter(m => m.nivel === nvl);
                    return `
                    <div class="border-l-2 border-secondary-500 pl-4">
                        <h3 class="text-secondary-500 font-bold mb-2 uppercase text-sm">${nvl === 0 ? '⭐ Truques' : '🔮 Círculo ' + nvl}</h3>
                        <div class="grid gap-2">
                            ${magias.length > 0 ? magias.map((m, idx) => `
                                <div class="arcane-box p-3">
                                    <input type="text" value="${m.nome}" data-idx="${fichaKael.magias.lista.indexOf(m)}" data-campo="nome" class="magia-input font-bold text-gray-100 bg-transparent border-b-2 border-secondary-500 pb-1 w-full focus:outline-none text-sm" />
                                    <textarea class="magia-input w-full bg-dark-700 rounded px-2 py-1 text-xs text-gray-300 mt-2 focus:outline-none border border-dark-600 focus:border-secondary-400 min-h-16" data-idx="${fichaKael.magias.lista.indexOf(m)}" data-campo="desc">${m.desc}</textarea>
                                </div>
                            `).join('') : '<div class="text-gray-500 italic text-sm">Nenhuma magia conhecida neste círculo.</div>'}
                        </div>
                    </div>
                    `;
                }).join('') : '<div class="text-gray-500 italic text-sm">Nenhuma magia adicionada ainda.</div>'}
            </div>
        </div>`;
    return html;
}

function renderHistoria() {
    return `<div class="p-6 bg-dark-800 rounded-lg border border-dark-700">
        <h2 class="text-xl font-bold text-primary-500 mb-4">História</h2>
        <textarea id="historiaInput" rows="12" class="w-full bg-dark-700 rounded px-3 py-2 text-gray-100 focus:outline-none" placeholder="Digite a história do personagem aqui...">${fichaKael.historia}</textarea>
    </div>`;
}
