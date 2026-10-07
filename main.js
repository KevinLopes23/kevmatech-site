/* Kevma Tech — interações do site. Sem dependências; o site funciona completo sem este arquivo. */
(() => {
  'use strict';

  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const temObserver = 'IntersectionObserver' in window;

  /* Barra de progresso da leitura */
  const barra = document.querySelector('.progresso');
  if (barra) {
    const atualizar = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : '0');
    };
    window.addEventListener('scroll', atualizar, { passive: true });
    window.addEventListener('resize', atualizar);
    atualizar();
  }

  /* Elementos que surgem ao rolar */
  if (!reduzirMovimento && temObserver) {
    const alvos = document.querySelectorAll('.cabeca, .dor, .passo, .plano, .oferta, .pessoa, .duvidas details, .final .container');
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('visivel');
        observador.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    alvos.forEach((el) => {
      const posicao = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.setProperty('--i', String(posicao % 4));
      el.classList.add('revela');
      observador.observe(el);
    });
  }

  /* Busca da abertura: "Sua empresa" sobe de 8º para 1º */
  const busca = document.querySelector('[data-busca]');
  if (busca && !reduzirMovimento && temObserver) {
    const ranking = busca.querySelector('.ranking');
    const itens = Array.from(busca.querySelectorAll('.resultado'));
    const voce = itens[0];
    const outros = itens.slice(1);
    const pos = voce.querySelector('[data-pos]');
    let espera;
    let contador;

    const posicionar = (el, slot, texto) => {
      el.style.setProperty('--slot', String(slot));
      el.querySelector('.pos').textContent = texto;
    };

    const estadoInicial = () => {
      ranking.classList.add('sem-transicao');
      voce.classList.add('inicio');
      posicionar(voce, 3, '8º');
      outros.forEach((el, i) => posicionar(el, i, `${i + 1}º`));
      void ranking.offsetHeight; // aplica sem animar antes de reativar a transição
      ranking.classList.remove('sem-transicao');
    };

    const estadoFinal = () => {
      voce.classList.remove('inicio');
      voce.style.setProperty('--slot', '0');
      outros.forEach((el, i) => posicionar(el, i + 1, `${i + 2}º`));
      let n = 8;
      clearInterval(contador);
      contador = setInterval(() => {
        n -= 1;
        pos.textContent = `${n}º`;
        if (n <= 1) clearInterval(contador);
      }, 95);
    };

    const ciclo = () => {
      estadoInicial();
      espera = setTimeout(() => {
        estadoFinal();
        espera = setTimeout(ciclo, 5600);
      }, 1100);
    };

    new IntersectionObserver(([e]) => {
      clearTimeout(espera);
      if (e.isIntersecting) ciclo();
    }, { threshold: 0.4 }).observe(busca);

    /* Inclinação 3D seguindo o mouse (só em telas com mouse) */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const hero = busca.closest('.hero');
      hero.addEventListener('mousemove', (ev) => {
        const r = busca.getBoundingClientRect();
        const x = (ev.clientX - (r.left + r.width / 2)) / r.width;
        const y = (ev.clientY - (r.top + r.height / 2)) / r.height;
        busca.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
        busca.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
      });
      hero.addEventListener('mouseleave', () => {
        busca.style.setProperty('--rx', '0deg');
        busca.style.setProperty('--ry', '0deg');
      });
    }
  }

  /* Sistemas: palco fixo no desktop, telas em linha no celular */
  const historia = document.querySelector('[data-historia]');
  if (historia && temObserver) {
    const palco = historia.querySelector('[data-palco]');
    const passos = Array.from(historia.querySelectorAll('.hpasso'));
    const telas = passos.map((p) => p.querySelector('.tela'));
    const desktop = window.matchMedia('(min-width: 981px)');

    const ativar = (indice) => {
      passos.forEach((p, i) => p.classList.toggle('ativo', i === indice));
      telas.forEach((t, i) => t.classList.toggle('ativa', i === indice));
    };

    const montar = () => {
      if (desktop.matches) {
        telas.forEach((t) => palco.appendChild(t));
        historia.classList.add('com-palco');
        ativar(Math.max(0, passos.findIndex((p) => p.classList.contains('ativo'))));
      } else {
        telas.forEach((t, i) => { passos[i].appendChild(t); t.classList.remove('ativa'); });
        historia.classList.remove('com-palco');
      }
    };

    const observaPasso = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting && desktop.matches) ativar(passos.indexOf(e.target));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    passos.forEach((p) => observaPasso.observe(p));

    const observaTela = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!desktop.matches) e.target.classList.toggle('ativa', e.isIntersecting);
      });
    }, { threshold: 0.35 });
    telas.forEach((t) => observaTela.observe(t));

    montar();
    desktop.addEventListener('change', montar);
  }
})();
