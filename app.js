(function () {
  const N = window.NEGOCIOS;
  const app = document.getElementById('app');
  const reais = (v) => 'R$ ' + Math.round(Number(v)).toLocaleString('pt-BR');
  const NOMES_TAG = { mensal: 'paga todo mês', empresa: 'cliente empresa', pessoa: 'cliente pessoa', celular: 'dá no celular' };
  const tagsHtml = (n) => n.tags.map(t => `<span class="tag ${t}">${NOMES_TAG[t]}</span>`).join('');
  const dific = (d) => ['', 'Fácil de começar', 'Precisa de treino', 'Exige experiência'][d];
  const conta = (n) => n.conta.preco * n.conta.qtd;

  const guarda = {
    ler(k, pad) { try { const v = localStorage.getItem('pack-ia:' + k); return v == null ? pad : JSON.parse(v); } catch (e) { return pad; } },
    gravar(k, v) { try { localStorage.setItem('pack-ia:' + k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } }
  };
  const toast = (() => { const el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); let t; return (txt) => { el.textContent = txt; el.classList.add('on'); clearTimeout(t); t = setTimeout(() => el.classList.remove('on'), 1800); }; })();
  const copiar = (txt, aviso) => {
    const ok = () => toast(aviso || 'Copiado!');
    const fallback = () => { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, () => { fallback(); ok(); }); else { fallback(); ok(); }
  };
  const rola = (el, alvo, fmt, ms) => {
    const t0 = performance.now(), dur = ms || 900;
    const passo = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(alvo * e); if (p < 1) requestAnimationFrame(passo); };
    requestAnimationFrame(passo);
  };
  const revela = () => {
    const els = app.querySelectorAll('.aparece');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('on')); return; }
    const io = new IntersectionObserver((ent) => ent.forEach(x => { if (x.isIntersecting) { x.target.classList.add('on'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  };

  const cartao = (n, i) => `
    <a class="cartao aparece" href="#/n/${n.id}" style="transition-delay:${(i % 6) * 60}ms">
      <span class="num">${String(n.n).padStart(2, '0')}</span>
      ${n.campeao ? '<span class="campeao">🔥 o mais pedido</span>' : ''}
      <span class="emo">${n.emoji}</span>
      <h3>${n.nome}</h3>
      <p>${n.frase}</p>
      <div class="tags">${tagsHtml(n)}</div>
      <div class="rodape-c"><div><span>Pra começar</span><b>R$ 0</b></div><div style="text-align:right"><span>Exemplo de conta</span><b>${reais(conta(n))}/mês</b></div></div>
    </a>`;

  const FILTROS = [
    ['todos', 'Todos', () => true],
    ['celular', 'Dá no celular', n => n.tags.includes('celular')],
    ['mensal', 'Paga todo mês', n => n.tags.includes('mensal')],
    ['empresa', 'Cliente empresa', n => n.tags.includes('empresa')],
    ['pessoa', 'Cliente pessoa', n => n.tags.includes('pessoa')],
    ['facil', 'Fácil de começar', n => n.dificuldade === 1]
  ];
  let filtro = guarda.ler('filtro', 'todos');

  const inicio = () => {
    const mensais = N.filter(n => n.tags.includes('mensal')).length;
    const celular = N.filter(n => n.tags.includes('celular')).length;
    app.innerHTML = `
    <section class="pagina">
      <div class="heroi">
        <div>
          <h1 class="etiqueta">Negócios com IA</h1><br>
          <div class="etiqueta branca sub">🤖 20 serviços pra vender com IA, sem gastar nada pra começar</div>
          <p class="lead">Cada negócio tem as ferramentas grátis, os prompts prontos, quanto o mercado cobra, a conta do mês, a mensagem pro primeiro cliente e o checklist da semana.</p>
          <div class="acoes"><a class="botao" href="#/escolher">🎯 Me ajuda a escolher</a><a class="botao claro" href="#/comecar">📋 Antes de começar</a></div>
        </div>
        <div class="ze-caixa" id="zeCaixa"></div>
      </div>
      <div class="numeros">
        <div class="numero"><b data-n="0" data-r>R$ 0</b><span>pra começar: só ferramentas com plano grátis</span></div>
        <div class="numero"><b data-n="${celular}">0</b><span>dá pra fazer só com o celular</span></div>
        <div class="numero"><b data-n="${mensais}">0</b><span>com cliente que paga todo mês</span></div>
      </div>
      <div class="barra"><h2>Os 20 negócios</h2>${FILTROS.map(f => `<button class="chip${f[0] === filtro ? ' on' : ''}" data-f="${f[0]}">${f[1]}</button>`).join('')}</div>
      <div class="grade" id="grade"></div>
    </section>`;
    const caixa = document.getElementById('zeCaixa'); caixa.appendChild(document.getElementById('ze').content.cloneNode(true));
    ['🤖', '💸', '✨', '💵'].forEach((g, i) => { const s = document.createElement('span'); s.className = 'grana'; s.textContent = g; s.style.left = (12 + i * 22) + '%'; s.style.top = '0'; s.style.animationDelay = (1.4 + i * 0.85) + 's'; caixa.appendChild(s); });
    app.querySelectorAll('.numero b').forEach(b => { if (+b.dataset.n > 0) rola(b, +b.dataset.n, v => Math.round(v), 1100); });
    const pinta = () => {
      const f = FILTROS.find(x => x[0] === filtro) || FILTROS[0];
      const lista = N.filter(f[2]);
      document.getElementById('grade').innerHTML = lista.length ? lista.map(cartao).join('') : '<div class="vazio">Nenhum negócio nesse filtro.</div>';
      revela();
    };
    app.querySelectorAll('.chip').forEach(c => c.onclick = () => { filtro = c.dataset.f; guarda.gravar('filtro', filtro); app.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === c)); pinta(); });
    pinta();
  };

  const negocio = (id) => {
    const i = N.findIndex(n => n.id === id); if (i < 0) return inicio();
    const n = N[i], ant = N[(i + N.length - 1) % N.length], prox = N[(i + 1) % N.length];
    const c = n.conta;
    const passoPreco = c.precoMax <= 50 ? 1 : c.precoMax <= 300 ? 5 : c.precoMax <= 1000 ? 10 : 50;
    const passoQtd = c.qtdMax >= 500 ? 10 : c.qtdMax >= 100 ? 5 : 1;
    const checks = guarda.ler('checks:' + n.id, []);
    const nome = guarda.ler('nome', '');
    app.innerHTML = `
    <article class="pagina">
      <a class="volta" href="#/">← Todos os negócios</a>
      <div class="cabeca">
        <div class="grande">${n.emoji}</div>
        <div><div class="qual">Negócio ${String(n.n).padStart(2, '0')} de 20 · ${dific(n.dificuldade)}</div><h1>${n.nome}</h1><p>${n.frase}</p></div>
      </div>
      <div class="tags">${tagsHtml(n)}</div>
      <div class="resumo">
        <div class="aparece"><small>Pra começar</small><b>R$ 0</b><span class="quem">ferramentas com plano grátis</span></div>
        <div class="aparece" style="transition-delay:80ms"><small>Quanto o mercado cobra</small><b>${n.cobrar[0][1]}</b><span class="quem">${n.cobrar[0][0]}</span></div>
        <div class="aparece" style="transition-delay:160ms"><small>Quem paga</small><div class="quem">${n.quem}</div></div>
      </div>

      <section class="bloco aparece"><h2><span class="ic">💡</span>Por que dá dinheiro</h2><p>${n.porque}</p></section>

      <section class="bloco aparece"><h2><span class="ic">🧰</span>As ferramentas (grátis)</h2>
        <table class="lista">${n.ferramentas.map(x => `<tr><td><span class="marca-item">✓</span><b>${x[0]}</b><br><span style="color:#5E594F;font-size:14px;padding-left:28px;display:inline-block">${x[1]}</span></td><td>grátis</td></tr>`).join('')}
          <tr class="total"><td>Total pra começar</td><td>R$ 0</td></tr></table>
        <div class="nota">Tu usa o celular ou o computador que já tem. Plano grátis pode ter limite de uso ou marca d'água, e as regras mudam: confere na ferramenta antes de entregar pro cliente.</div>
      </section>

      <section class="bloco aparece"><h2><span class="ic">🪄</span>Prompts prontos</h2>
        <p style="color:#5E594F">Troca o que está entre [colchetes] e cola no ChatGPT ou no Gemini.</p>
        ${n.prompts.map((p, k) => `<div class="prompt"><div class="prompt-tit">${p[0]}</div><div class="prompt-txt">${p[1]}</div><button class="botao mini" data-p="${k}">📋 Copiar prompt</button></div>`).join('')}
      </section>

      <section class="bloco aparece"><h2><span class="ic">💰</span>Quanto cobrar</h2>
        <table class="lista">${n.cobrar.map(x => `<tr><td>${x[0]}</td><td>${x[1]}</td></tr>`).join('')}</table>
        <div class="nota">"est." = estimativa nossa, sem fonte brasileira boa. Antes de fechar tua tabela, vê quanto 3 concorrentes da tua cidade cobram.</div>
      </section>

      <section class="bloco aparece"><h2><span class="ic">🧮</span>A conta do mês</h2>
        <div class="calc">
          <div>
            <div class="campo"><label>Preço ${c.un} <output id="oPreco"></output></label><input id="iPreco" type="range" min="${passoPreco}" max="${c.precoMax}" step="${passoPreco}" value="${c.preco}"></div>
            <div class="campo"><label>${c.qtdLabel[0].toUpperCase() + c.qtdLabel.slice(1)} <output id="oQtd"></output></label><input id="iQtd" type="range" min="${passoQtd}" max="${c.qtdMax}" step="${passoQtd}" value="${c.qtd}"></div>
            <div class="nota">${n.contaNota}</div>
          </div>
          <div class="res">
            <div class="linha"><span>Faturamento</span><b id="rFat"></b></div>
            <div class="linha"><span>Ferramentas</span><b>R$ 0</b></div>
            <div class="linha"><span>Imposto do MEI (aprox.)</span><b>− R$ 86</b></div>
            <div class="barras"><div class="barra-c"><i id="bFat" style="background:var(--azul)"></i></div><div class="barra-c"><i id="bSobra" style="background:var(--verde)"></i></div></div>
            <div class="sobra"><small>Pode sobrar no mês, se tu fechar esses clientes</small><b id="rSobra"></b></div>
            <div class="aviso">Exemplo de conta com o preço de mercado, não promessa. O resultado depende de quantos clientes tu fecha e do preço da tua cidade.</div>
          </div>
        </div>
      </section>

      <section class="bloco aparece"><h2><span class="ic">🎯</span>Como fechar o primeiro cliente</h2><ol class="passos">${n.passos.map(p => `<li>${p}</li>`).join('')}</ol></section>

      <section class="bloco aparece"><h2><span class="ic">💬</span>Mensagem pronta pra mandar</h2>
        <input class="msg-nome" id="iNome" placeholder="Teu nome (entra na mensagem)" value="${nome.replace(/"/g, '&quot;')}">
        <div class="balao" id="balao"></div>
        <div class="msg-acoes"><button class="botao" id="bCopia">📋 Copiar mensagem</button><a class="botao verde" id="bZap" target="_blank" rel="noopener">Abrir no WhatsApp</a></div>
      </section>

      <section class="bloco aparece"><h2><span class="ic">✅</span>Checklist da primeira semana</h2>
        <div class="progresso"><i id="prog"></i></div><small id="progTxt"></small>
        <ul class="checks">${n.semana.map((s, k) => `<li><label><input type="checkbox" data-k="${k}"${checks.includes(k) ? ' checked' : ''}><span>${s}</span></label></li>`).join('')}</ul>
      </section>

      <section class="bloco alerta aparece"><h2><span class="ic">⚠️</span>Cuidado com isso</h2><ul>${n.cuidados.map(x => `<li>${x}</li>`).join('')}</ul></section>

      <nav class="navega"><a href="#/n/${ant.id}"><small>← Anterior</small>${ant.emoji} ${ant.nome}</a><a href="#/n/${prox.id}"><small>Próximo →</small>${prox.emoji} ${prox.nome}</a></nav>
    </article>`;

    app.querySelectorAll('.prompt .botao').forEach(b => b.onclick = () => copiar(n.prompts[+b.dataset.p][1], 'Prompt copiado!'));

    const iP = document.getElementById('iPreco'), iQ = document.getElementById('iQtd'), sobraEl = document.getElementById('rSobra');
    let primeira = true;
    const calc = () => {
      const p = +iP.value, q = +iQ.value, fat = p * q, sobra = fat - 86;
      document.getElementById('oPreco').textContent = reais(p);
      document.getElementById('oQtd').textContent = q.toLocaleString('pt-BR');
      document.getElementById('rFat').textContent = reais(fat);
      const topo = Math.max(fat, 1);
      document.getElementById('bFat').style.width = '100%';
      document.getElementById('bSobra').style.width = (Math.max(0, sobra) / topo * 100) + '%';
      if (primeira) { rola(sobraEl, sobra, v => reais(v), 1000); primeira = false; } else { sobraEl.textContent = reais(sobra); sobraEl.classList.add('bate'); setTimeout(() => sobraEl.classList.remove('bate'), 120); }
    };
    iP.oninput = calc; iQ.oninput = calc; calc();

    const iN = document.getElementById('iNome'), balao = document.getElementById('balao'), zap = document.getElementById('bZap');
    const texto = () => n.msg.replace('{nome}', iN.value.trim() || '[teu nome]');
    const msg = () => { balao.textContent = texto(); zap.href = 'https://wa.me/?text=' + encodeURIComponent(texto()); };
    iN.oninput = () => { guarda.gravar('nome', iN.value); msg(); }; msg();
    document.getElementById('bCopia').onclick = () => copiar(texto(), 'Mensagem copiada!');

    const prog = () => {
      const tot = n.semana.length, feitos = app.querySelectorAll('.checks input:checked').length;
      document.getElementById('prog').style.width = (feitos / tot * 100) + '%';
      document.getElementById('progTxt').textContent = feitos === tot ? 'Semana completa. Agora é só repetir! 🔥' : `${feitos} de ${tot} feitos`;
    };
    app.querySelectorAll('.checks input').forEach(ch => ch.onchange = () => {
      const marcados = [...app.querySelectorAll('.checks input:checked')].map(x => +x.dataset.k);
      guarda.gravar('checks:' + n.id, marcados); prog();
      if (marcados.length === n.semana.length) toast('Semana completa! 🔥');
    });
    prog();
    revela();
  };

  // ---------- escolher ----------
  const GOSTO = {
    escrever: ['curriculo', 'anuncio', 'roteiro', 'campanha', 'avaliacoes', 'google', 'zap', 'social'],
    imagem: ['fotoproduto', 'logo', 'cardapio', 'promo', 'convite', 'imovel', 'slides', 'social'],
    video: ['reels', 'cortes', 'locucao', 'roteiro'],
    organizar: ['planilha', 'site', 'zap', 'google', 'slides']
  };
  const PERGUNTAS = [
    ['gosto', 'O que tu curte mais?', [['escrever', '✍️ Escrever'], ['imagem', '🎨 Mexer com imagem'], ['video', '🎬 Vídeo e áudio'], ['organizar', '🗂️ Organizar coisas']]],
    ['cliente', 'Tu prefere atender quem?', [['empresa', 'Empresa e comércio'], ['pessoa', 'Pessoa comum'], ['tanto', 'Tanto faz']]],
    ['aparelho', 'O que tu tem pra trabalhar?', [['celular', 'Só o celular'], ['pc', 'Celular e computador']]],
    ['ritmo', 'O que pesa mais pra ti?', [['mensal', 'Cliente que paga todo mês'], ['rapido', 'Começar rápido e fácil'], ['ticket', 'Serviço que paga mais por vez']]]
  ];
  const escolher = () => {
    const r = guarda.ler('quiz', {});
    app.innerHTML = `
    <section class="pagina quiz">
      <a class="volta" href="#/">← Todos os negócios</a>
      <h1 class="etiqueta" style="margin-top:22px;font-size:clamp(28px,6vw,44px);transform:rotate(-1.5deg)">Qual é o teu?</h1>
      <p style="color:var(--txt2);margin-top:16px">Responde 4 perguntas e o Zé separa os 3 negócios com IA que mais combinam contigo.</p>
      ${PERGUNTAS.map(p => `<div class="pergunta"><h3>${p[1]}</h3><div class="opcoes">${p[2].map(o => `<button class="opcao${r[p[0]] === o[0] ? ' on' : ''}" data-p="${p[0]}" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`).join('')}
      <div id="resultado"></div>
    </section>`;
    const calcula = () => {
      const el = document.getElementById('resultado');
      if (PERGUNTAS.some(p => !r[p[0]])) { el.innerHTML = ''; return; }
      const lista = N.map(n => {
        let s = 0;
        if ((GOSTO[r.gosto] || []).includes(n.id)) s += 12;
        if (r.cliente !== 'tanto' && n.tags.includes(r.cliente)) s += 8;
        if (r.aparelho === 'celular') s += n.tags.includes('celular') ? 6 : -20;
        if (r.ritmo === 'mensal' && n.tags.includes('mensal')) s += 7;
        if (r.ritmo === 'rapido') s += (3 - n.dificuldade) * 4;
        if (r.ritmo === 'ticket') s += Math.min(8, n.conta.preco / 60);
        if (n.campeao) s += 1;
        return [s, n];
      }).sort((a, b) => b[0] - a[0]).slice(0, 3).map(x => x[1]);
      el.innerHTML = `<div class="barra"><h2>Os 3 do teu perfil</h2></div><div class="grade">${lista.map(cartao).join('')}</div>`;
      revela();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    app.querySelectorAll('.opcao').forEach(b => b.onclick = () => {
      r[b.dataset.p] = b.dataset.v; guarda.gravar('quiz', r);
      app.querySelectorAll(`.opcao[data-p="${b.dataset.p}"]`).forEach(x => x.classList.toggle('on', x === b));
      calcula();
    });
    if (PERGUNTAS.every(p => r[p[0]])) calcula();
  };

  // ---------- antes de começar ----------
  const comecar = () => {
    app.innerHTML = `
    <section class="pagina texto" style="max-width:760px;margin:0 auto">
      <a class="volta" href="#/">← Todos os negócios</a>
      <h1 class="etiqueta" style="margin-top:22px;font-size:clamp(28px,6vw,44px);transform:rotate(-1.5deg)">Antes de começar</h1>
      <h2>1. Escolhe um só</h2>
      <p>Escolhe 1 negócio, fecha os 3 primeiros clientes e só depois soma o segundo. Vários combinam entre si: roteiro + Reels, social media + artes de promoção, Perfil do Google + avaliações.</p>
      <h2>2. Monta o portfólio antes de vender</h2>
      <p>Ninguém compra serviço sem ver exemplo. Faz 3 a 9 amostras (pode ser pra negócio fictício ou de conhecido) e guarda tudo num perfil ou pasta que abre no celular.</p>
      <h2>3. A IA faz o rascunho, tu faz o acabamento</h2>
      <p>O cliente paga pelo resultado com a cara dele. Revisa todo texto que a IA escreveu, troca o que soa robô e confere os fatos. Texto sem revisão é o que faz cliente cancelar.</p>
      <h2>4. Formaliza com o MEI</h2>
      <p>Empresa pede nota. A maioria desses serviços cabe no MEI, que se abre de graça no Portal do Empreendedor (gov.br). Em 2026 o imposto do MEI de serviço fica em torno de R$ 86 por mês, com limite de R$ 81 mil por ano. Confere se a tua atividade está na lista.</p>
      <h2>5. Como chegar no teu preço</h2>
      <p class="formula">preço = (horas × quanto tu quer por hora) + 20%</p>
      <p>Começa um pouco abaixo da faixa de mercado do pack, junta 3 depoimentos reais e sobe o preço.</p>
      <h2>6. Regras que protegem o teu cliente (e tu)</h2>
      <ul>
        <li><b>Plano grátis:</b> confere se permite uso comercial e se tem marca d'água antes de entregar.</li>
        <li><b>Direito autoral:</b> nada de música, personagem, foto ou logo de outra marca.</li>
        <li><b>Nada de enganar:</b> foto de produto, prato ou imóvel mostra o que é de verdade.</li>
        <li><b>Dados (LGPD):</b> apaga os dados do cliente quando terminar e nunca dispara mensagem pra lista comprada.</li>
      </ul>
      <h2 id="fontes">De onde vêm os números</h2>
      <p>Pesquisamos em novembro de 2026 em guias de preço e tabelas de freelancers. São médias: na tua cidade pode ser mais ou menos. Onde está "est.", não achamos fonte brasileira boa e fizemos uma estimativa.</p>
      <ul class="fontes">${window.FONTES.map(f => `<li><a href="${f[1]}" target="_blank" rel="noopener">${f[0]}</a></li>`).join('')}</ul>
    </section>`;
  };

  const rota = () => {
    const h = location.hash.replace(/^#\/?/, '');
    document.querySelectorAll('.topo nav a').forEach(a => a.classList.toggle('ativo', a.getAttribute('href') === '#/' + h));
    if (h.startsWith('n/')) negocio(h.slice(2));
    else if (h === 'escolher') escolher();
    else if (h === 'comecar') comecar();
    else inicio();
    window.scrollTo(0, 0);
  };
  window.addEventListener('hashchange', rota);
  rota();
})();
