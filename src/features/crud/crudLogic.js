export const REQ_POR_PAGINA = 8;

export function filterRequisitos(requisitos, filtro) {
  let out = requisitos;
  if (filtro.texto) out = out.filter(r => r.texto.toLowerCase().includes(filtro.texto.toLowerCase()));
  if (filtro.temaId) out = out.filter(r => r.temaId === filtro.temaId);
  if (filtro.tipo) out = out.filter(r => r.tipo === filtro.tipo);
  return out;
}

export function buildPageList(totalPaginas, paginaAtual) {
  const paginas = [];
  for (let p = 1; p <= totalPaginas; p++) {
    if (p === 1 || p === totalPaginas || Math.abs(p - paginaAtual) <= 1) paginas.push(p);
    else if (paginas[paginas.length - 1] !== '...') paginas.push('...');
  }
  return paginas;
}
