import { PorHoras } from './Employee.js';

const DEDUCCIONES = {
    salud: 0.02,        // 2% salud (empleado)
    pension: 0.02,      // 2% pensión (empleado)
    arl: 0.00522        // 0.522% ARL (riesgo I)
};

const BONO_ALIMENTACION = 1_000_000;

export class PayrollService {
    /**
     * Calcula la nómina completa de un empleado incluyendo prima y deducciones detalladas.
     * @param {Employee} employee
     * @returns {Object}
     */
    static calculatePayroll(employee) {
        const gross = employee.calculateGrossSalary();

        // Deducciones obligatorias desglosadas
        const dedSalud = gross * DEDUCCIONES.salud;
        const dedPension = gross * DEDUCCIONES.pension;
        const dedARL = gross * DEDUCCIONES.arl;
        const totalDeducciones = dedSalud + dedPension + dedARL;

        // Beneficios
        const beneficios = [];

        // Bono alimentación (permanentes)
        if (employee.isPermanent()) {
            beneficios.push({ concepto: 'Bono Alimentación', valor: BONO_ALIMENTACION });
        }

        // Fondo de ahorro (Por Horas > 1 año)
        if (employee instanceof PorHoras && employee.isEligibleForSavingsFund()) {
            const ahorro = gross * 0.02;
            beneficios.push({ concepto: 'Fondo Ahorro (2%)', valor: ahorro });
        }

        // Prima mensual (todos los empleados)
        const prima = employee.calculatePrima();
        beneficios.push({ concepto: 'Prima (1/12)', valor: prima });

        // Cálculo del neto: bruto - deducciones + beneficios (excepto fondo de ahorro que no ingresa al neto)
        let neto = gross - totalDeducciones;
        beneficios.forEach(b => {
            // El fondo de ahorro no se suma al neto porque es un depósito aparte
            if (!b.concepto.includes('Fondo Ahorro')) {
                neto += b.valor;
            }
        });

        if (neto < 0) {
            throw new Error(`Salario neto negativo para ${employee.name}: $${neto}`);
        }

        return {
            employee,
            salarioBruto: gross,
            deducciones: {
                salud: dedSalud,
                pension: dedPension,
                arl: dedARL,
                total: totalDeducciones
            },
            beneficios,
            salarioNeto: neto
        };
    }
}