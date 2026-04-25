import { Asalariado, PorHoras, Comision, Temporal } from './Employee.js';
import { PayrollService } from './PayrollService.js';

// ─── DATOS DE EMPLEADOS (sin cambios, los mismos 21) ───
const empleados = [
    new Asalariado(1, 'Laura Martínez', 4_500_000, 7, '2017-03-15'),
    new Asalariado(2, 'Carlos Ríos', 5_200_000, 3, '2021-08-20'),
    new Asalariado(3, 'Andrea Gómez', 6_000_000, 10, '2014-01-10'),
    new Asalariado(4, 'Roberto Díaz', 3_800_000, 4, '2020-06-05'),
    new Asalariado(5, 'Catalina Ruiz', 7_200_000, 8, '2016-11-30'),
    new PorHoras(6, 'Pedro Infante', 25_000, 45, '2023-02-01', true, true),
    new PorHoras(7, 'Ana López', 18_500, 38, '2024-09-10', false, false),
    new PorHoras(8, 'Luis Torres', 22_000, 42, '2022-07-22', true, false),
    new PorHoras(9, 'Marta Gil', 30_000, 20, '2024-05-18', false, false),
    new PorHoras(10, 'Jorge Salas', 19_000, 50, '2021-12-01', true, true),
    new PorHoras(11, 'Sara Vega', 21_500, 35, '2024-11-01', false, true),
    new Comision(12, 'María Fernanda', 1_200_000, 22_000_000, 0.05, '2019-04-10'),
    new Comision(13, 'Diego Castro', 1_200_000, 8_500_000, 0.07, '2022-09-01'),
    new Comision(14, 'Valentina Ríos', 1_500_000, 35_000_000, 0.04, '2018-11-20'),
    new Comision(15, 'Héctor Pardo', 900_000, 19_500_000, 0.06, '2023-06-14'),
    new Comision(16, 'Lucía Mora', 1_100_000, 12_000_000, 0.08, '2024-01-05'),
    new Temporal(17, 'Sofía Herrera', 2_800_000, 6, '2025-01-10', '2025-07-10'),
    new Temporal(18, 'Javier Torres', 3_100_000, 12, '2024-08-15', '2025-08-15'),
    new Temporal(19, 'Carla Mendoza', 2_500_000, 3, '2025-02-01', '2025-05-01'),
    new Temporal(20, 'Esteban Quintero', 3_300_000, 9, '2024-11-01', '2025-08-01'),
    new Temporal(21, 'Daniela Fuentes', 2_900_000, 4, '2025-03-20', '2025-07-20')
];

const resultados = empleados.map(emp => {
    try {
        return PayrollService.calculatePayroll(emp);
    } catch (error) {
        console.error(`Error en ${emp.name}:`, error.message);
        return { employee: emp, error: error.message };
    }
});

// ─── PRUEBAS UNITARIAS (incluidas las nuevas) ───
function ejecutarPruebas() {
    const asserts = [];
    function pass(msg) { asserts.push({ msg, ok: true }); }
    function fail(msg) { asserts.push({ msg, ok: false }); }

    // Pruebas existentes...
    const l = new Asalariado(99, 'T', 4_000_000, 6, '2018-01-01');
    if (l.calculateGrossSalary() === 4_400_000) pass('Asalariado >5 años: bono 10%');
    else fail('Asalariado >5 años falló');

    const c = new Asalariado(98, 'T', 4_000_000, 3, '2022-01-01');
    if (c.calculateGrossSalary() === 4_000_000) pass('Asalariado ≤5 años sin bono');

    const a = new PorHoras(97, 'T', 20_000, 45, '2023-01-01');
    if (a.calculateGrossSalary() === 950_000) pass('Horas extra 1.5x');

    const m = new Comision(96, 'T', 1_000_000, 25_000_000, 0.05, '2020-01-01');
    if (Math.abs(m.calculateGrossSalary() - 3_000_000) < 1) pass('Comisión bono extra');

    const s = new Temporal(95, 'T', 2_800_000, 6, '2025-01-01', '2025-06-01');
    if (s.calculateGrossSalary() === 2_800_000) pass('Temporal salario fijo');

    const res = PayrollService.calculatePayroll(new Asalariado(94, 'T', 1_000_000, 0, '2024-01-01'));
    const dedSalud = 1_000_000 * 0.02;
    const dedPension = 1_000_000 * 0.02;
    const dedARL = 1_000_000 * 0.00522;
    const totalDedEsperado = dedSalud + dedPension + dedARL;
    if (Math.abs(res.deducciones.total - totalDedEsperado) < 1) pass('Deducciones desglosadas correctas');

    try {
        new PorHoras(93, 'T', 10_000, -5, '2024-01-01').calculateGrossSalary();
        fail('Horas negativas no lanzaron error');
    } catch (e) { pass('Validación horas negativas'); }

    const conFondo = new PorHoras(92, 'T', 20_000, 40, '2022-05-05', true, true);
    const payroll = PayrollService.calculatePayroll(conFondo);
    if (payroll.beneficios.some(b => b.concepto.includes('Fondo'))) pass('Fondo ahorro');
    else fail('Fondo no aparece');

    const empQ = new Asalariado(91, 'Q', 1, 0, '2025-01-01');
    if (/\d{2}\/\d{2}\/\d{4}/.test(empQ.getNextPayday())) pass('Formato próxima quincena');

    const tempF = new Temporal(90, 'F', 1, 1, '2025-01-01', '2025-12-31');
    if (tempF.getContractEndString() === '31/12/2025') pass('Fecha fin contrato');

    const antiguo = new Asalariado(89, 'A', 1, 5, '2020-06-01');
    if (antiguo.getTimeWithCompanyString().includes('año') || antiguo.getTimeWithCompanyString().includes('mes')) pass('Tiempo en empresa');

    // Nuevas pruebas de prima
    const asal = new Asalariado(88, 'PrimaTest', 1_200_000, 0, '2025-01-01');
    if (Math.abs(asal.calculatePrima() - 100_000) < 1) pass('Prima asalariado correcta (1/12)');

    const porH = new PorHoras(87, 'PrimaHora', 20_000, 40, '2025-01-01');
    if (Math.abs(porH.calculatePrima() - (800_000/12)) < 1) pass('Prima por horas correcta');

    // Verificar que la prima aparece en los beneficios
    const resAsal = PayrollService.calculatePayroll(asal);
    if (resAsal.beneficios.some(b => b.concepto.includes('Prima'))) pass('Prima incluida en beneficios');
    else fail('Prima no aparece en beneficios');

    return asserts;
}

// ─── RENDERIZADO ─────────────────────────────
let filtroActivo = 'all';

function renderizarTabla() {
    const container = document.getElementById('payroll-table-container');
    if (!container) return;

    const filtrados = filtroActivo === 'all'
        ? resultados
        : resultados.filter(r => r.employee && r.employee.type === filtroActivo);

    let html = `<div class="table-wrapper"><table>
        <thead><tr>
            <th>ID</th><th>Nombre</th><th>Tipo</th><th>Salario Bruto</th>
            <th>Salud (2%)</th><th>Pensión (2%)</th><th>ARL (0.52%)</th>
            <th>Total Deducc.</th><th>Beneficios</th><th>Prima</th><th>Salario Neto</th>
            <th>Próx. Quincena</th><th>Fin Contrato</th><th>Tiempo Empresa</th>
        </tr></thead><tbody>`;

    filtrados.forEach(r => {
        if (r.error) {
            html += `<tr><td colspan="14" style="color:red">Error: ${r.employee.name} - ${r.error}</td></tr>`;
            return;
        }
        const emp = r.employee;
        const beneficiosSinPrima = r.beneficios.filter(b => !b.concepto.includes('Prima'));
        const beneficiosStr = beneficiosSinPrima.length
            ? beneficiosSinPrima.map(b => `${b.concepto}: $${b.valor.toLocaleString()}`).join('<br>')
            : '—';
        const primaObj = r.beneficios.find(b => b.concepto.includes('Prima'));
        const primaValor = primaObj ? primaObj.valor : 0;

        html += `<tr>
            <td>${emp.id}</td>
            <td><strong>${emp.name}</strong></td>
            <td>${emp.type}</td>
            <td class="positive">$${r.salarioBruto.toLocaleString()}</td>
            <td class="deduction">-$${r.deducciones.salud.toLocaleString()}</td>
            <td class="deduction">-$${r.deducciones.pension.toLocaleString()}</td>
            <td class="deduction">-$${r.deducciones.arl.toLocaleString()}</td>
            <td class="deduction">-$${r.deducciones.total.toLocaleString()}</td>
            <td class="benefit">${beneficiosStr}</td>
            <td class="prima">$${primaValor.toLocaleString()}</td>
            <td class="positive">$${r.salarioNeto.toLocaleString()}</td>
            <td>${emp.getNextPayday()}</td>
            <td>${emp.getContractEndString()}</td>
            <td>${emp.getTimeWithCompanyString()}</td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function configurarFiltros() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtroActivo = btn.dataset.filter;
            renderizarTabla();
        });
    });
}

function renderizarPruebas() {
    const container = document.getElementById('test-results');
    if (!container) return;
    const pruebas = ejecutarPruebas();
    const pasaron = pruebas.filter(t => t.ok).length;
    container.innerHTML = `<p><strong>${pasaron}/${pruebas.length} pruebas superadas</strong></p>` +
        pruebas.map(t => `<span class="${t.ok ? 'test-pass' : 'test-fail'}">${t.ok ? '✅' : '❌'} ${t.msg}</span>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    renderizarTabla();
    configurarFiltros();
    renderizarPruebas();
    console.log('✅ Sistema con primas y deducciones detalladas listo.');
});