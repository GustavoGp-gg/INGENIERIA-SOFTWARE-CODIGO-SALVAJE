// ──────────────────────────────────────────────
// CLASES DE EMPLEADOS (incluye cálculo de prima legal)
// ──────────────────────────────────────────────

export class Employee {
    constructor(id, name, type, startDate, contractEndDate = null) {
        if (new.target === Employee) {
            throw new Error("Clase abstracta Employee no puede ser instanciada directamente");
        }
        this.id = id;
        this.name = name;
        this.type = type;
        this.startDate = startDate instanceof Date ? startDate : new Date(startDate);
        this.contractEndDate = contractEndDate ? (contractEndDate instanceof Date ? contractEndDate : new Date(contractEndDate)) : null;
    }

    calculateGrossSalary() { throw new Error("Método abstracto"); }
    isPermanent() { return this.contractEndDate === null; }
    getYearsOfService() { return this.getTimeWithCompany().years; }

    /**
     * Calcula la prima mensual (1/12 del salario base mensual estimado)
     * Para empleados con salario variable se toma el salario bruto del mes.
     */
    calculatePrima() {
        return this.calculateGrossSalary() / 12;
    }

    getTimeWithCompany() {
        const now = new Date();
        const start = this.startDate;
        let diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        if (now.getDate() < start.getDate()) diffMonths--;
        const years = Math.floor(diffMonths / 12);
        const months = diffMonths % 12;
        return { years, months };
    }

    getTimeWithCompanyString() {
        const { years, months } = this.getTimeWithCompany();
        const parts = [];
        if (years > 0) parts.push(`${years} año${years > 1 ? 's' : ''}`);
        if (months > 0) parts.push(`${months} mes${months > 1 ? 'es' : ''}`);
        return parts.length ? parts.join(' ') : 'Menos de 1 mes';
    }

    getNextPayday() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        let payday;
        if (today.getDate() <= 15) {
            payday = new Date(year, month, 15);
        } else {
            payday = new Date(year, month + 1, 0);
        }
        const dd = String(payday.getDate()).padStart(2, '0');
        const mm = String(payday.getMonth() + 1).padStart(2, '0');
        return `${dd}/${mm}/${payday.getFullYear()}`;
    }

    getContractEndString() {
        if (this.contractEndDate) {
            const d = this.contractEndDate;
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            return `${dd}/${mm}/${d.getFullYear()}`;
        }
        return "Indefinido";
    }
}

export class Asalariado extends Employee {
    constructor(id, name, monthlySalary, yearsOfService, startDate) {
        super(id, name, 'Asalariado', startDate, null);
        this.monthlySalary = monthlySalary;
        this.yearsOfService = yearsOfService;
    }

    calculateGrossSalary() {
        let gross = this.monthlySalary;
        if (this.yearsOfService > 5) {
            gross += this.monthlySalary * 0.10;
        }
        return gross;
    }

    // La prima se calcula sobre el salario base (sin bono adicional)
    calculatePrima() {
        return this.monthlySalary / 12;
    }

    getYearsOfService() {
        return this.yearsOfService;
    }
}

export class PorHoras extends Employee {
    constructor(id, name, hourlyRate, hoursWorked, startDate, hasOneYearPlus = false, acceptsSavingsFund = false) {
        super(id, name, 'Por Horas', startDate, null);
        this.hourlyRate = hourlyRate;
        this.hoursWorked = hoursWorked;
        this.hasOneYearPlus = hasOneYearPlus;
        this.acceptsSavingsFund = acceptsSavingsFund;
    }

    calculateGrossSalary() {
        if (this.hoursWorked < 0) throw new Error("Horas trabajadas no pueden ser negativas");
        const regular = Math.min(this.hoursWorked, 40);
        const overtime = Math.max(this.hoursWorked - 40, 0);
        return (regular * this.hourlyRate) + (overtime * this.hourlyRate * 1.5);
    }

    // Prima calculada sobre el salario base sin horas extra (regular)
    calculatePrima() {
        const regularHours = Math.min(this.hoursWorked, 40);
        return (regularHours * this.hourlyRate) / 12;
    }

    isEligibleForSavingsFund() {
        return this.hasOneYearPlus && this.acceptsSavingsFund;
    }

    getYearsOfService() {
        return this.hasOneYearPlus ? 1.5 : 0.5;
    }
}

export class Comision extends Employee {
    constructor(id, name, baseSalary, salesAmount, commissionPercentage, startDate) {
        super(id, name, 'Comisión', startDate, null);
        this.baseSalary = baseSalary;
        this.salesAmount = salesAmount;
        this.commissionPercentage = commissionPercentage;
    }

    calculateGrossSalary() {
        if (this.salesAmount < 0) throw new Error("Ventas no pueden ser negativas");
        let gross = this.baseSalary + (this.salesAmount * this.commissionPercentage);
        if (this.salesAmount > 20_000_000) {
            gross += this.salesAmount * 0.03;
        }
        return gross;
    }

    // La prima se calcula sobre el salario base + comisiones (sin bono extra)
    calculatePrima() {
        const baseComision = this.baseSalary + (this.salesAmount * this.commissionPercentage);
        return baseComision / 12;
    }
}

export class Temporal extends Employee {
    constructor(id, name, monthlySalary, contractMonths, startDate, contractEndDate) {
        super(id, name, 'Temporal', startDate, contractEndDate);
        this.monthlySalary = monthlySalary;
        this.contractMonths = contractMonths;
    }

    calculateGrossSalary() {
        return this.monthlySalary;
    }

    calculatePrima() {
        return this.monthlySalary / 12;
    }
}