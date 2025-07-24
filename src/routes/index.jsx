import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "/src/components/Layout"; // Import Layout

import HomePage from "/src/pages/HomePage";
import AboutPage from "/src/pages/AboutPage";
import NotFoundPage from "/src/pages/NotFoundPage";
import LoginPage from "/src/pages/LoginPage";
import TestPage from "/src/pages/TestPage";
import MultiSelectForm from "/src/forms/MultiSelectForm";

import CompanyForm from "/src/forms/CompanyForms/Company_Form";
import BranchForm from "/src/forms/CompanyForms/Branch_form";
import WarehouseForm from "/src/forms/CompanyForms/Warehouse_form";

import CompanyPage from "/src/pages/CompanyPages/CompanyPage";
import BranchPage from "/src/pages/CompanyPages/BranchPage";
import WarehousePage from "/src/pages/CompanyPages/WarehousePage";

import UserForm from "/src/forms/UserForms/User_Form";
import SignupForm from "/src/forms/UserForms/SignupForm";
import RoleForm from "/src/forms/UserForms/Role_form";
import ShiftForm from "/src/forms/UserForms/Shift_form";
import SalaryForm from "/src/forms/UserForms/Salary_form";

import UserPage from "/src/pages/UserPages/UserPage";
import RolePage from "/src/pages/UserPages/RolePage";
import ShiftPage from "/src/pages/UserPages/ShiftPage";
import SalaryPage from "/src/pages/UserPages/SalaryPage";

import CategoryForm from "/src/forms/ProductForms/Category_form";
import CategoryPage from "/src/pages/ProductPages/CategoryPage";

import ProductPage from "/src/pages/ProductPages/ProductPage";
import ProductForm from "/src/forms/ProductForms/Product_Form";

import CustomerPage from "/src/pages/CustomerPages/CustomerPage";
import CustomerForm from "/src/forms/CustomerForms/Customer_form";

import TaxPage from "/src/pages/ReceiptPages/TaxPage";
import TaxForm from "/src/forms/ReceiptForms/Tax_form";

import AlertPage from "../pages/NotificationPages/AlertsPage";

import PurchaseOrderForm from "/src/forms/ProductForms/PurchaseOrderForm";
import ReceiptPage from "../pages/ReceiptPages/ReceiptPage";
import ReceiptForm from "../forms/ReceiptForms/Receipt_form";
import GRNPage from "../pages/ProductPages/GRNPage";
import GRNForm from "../forms/ProductForms/GRN_form";
import GiftCardPage from "../pages/ReceiptPages/GiftCardPage";
import GiftCardForm from "../forms/ReceiptForms/GiftCard_form";
import SupplierPage from "../pages/ProductPages/SupplierPage";
import SupplierForm from "../forms/ProductForms/Supplier_form";
import PurchaseOrderPage from "../pages/ProductPages/PurchaseOrderPage";
import SupplierInvoicePage from "../pages/ProductPages/SupplierInvoicePage";
import SupplierInvoiceForm from "../forms/ProductForms/SupplierInvoiceForm";
import InventoryPage from "../pages/ProductPages/InventoryPage";
import InventoryForm from "../forms/ProductForms/Inventory_form";
import ChangeLogPage from "../pages/LogPages/ChangeLogPage";
import ChangeLogForm from "../forms/LogForms/ChangeLogForm";
import PackOpenProduct from "../pages/ProductPages/PackOpenProduct";
import IngredientsPage from "../pages/ProductPages/IngredientsPage";
import IngredientsForm from "../forms/ProductForms/IngredientsForm";
import HomeMadeProductsForm from "../forms/ProductForms/HomeMadeProductsForm";
import PriceChecker from "../pages/PriceChecker";
// import InventoryTransferForm from "../forms/InventoryTransferFrom";
import PackOpenProducts from "../pages/ProductPages/PoPPage";
import BankPage from "../pages/CompanyPages/BankPage";
import BankForm from "../forms/CompanyForms/Bank_Form";
import FloorList from "../pages/CompanyPages/FloorPage";
import FloorForm from "../forms/CompanyForms/Floor_Form";
import AisleList from "../pages/CompanyPages/AislePage";
import AisleForm from "../forms/CompanyForms/Aisle_Form";
import SideList from "../pages/CompanyPages/SidePage";
import SideForm from "../forms/CompanyForms/Side_Form";
import AlertForm from "../forms/NotificationForms/AlertForm";
import WarningPage from "../pages/NotificationPages/WarningPage";
import WarningForm from "../forms/NotificationForms/WarningForm";
import TaskPage from "../pages/NotificationPages/TaskPage";
import TaskForm from "../forms/NotificationForms/TaskForm";
import CustomerLedgerPage from "../pages/CustomerPages/CustomerLegderPage";
import CustomerRepayment from "../forms/CustomerForms/CustomerRepayment_form";
import SupplierLedgerPage from "../pages/ProductPages/SupplierLedgerPage";
import CustomerPaymentsPage from "../pages/CustomerPages/CustomerPaymentPage";
import SupplierPaymentPage from "../pages/ProductPages/SupplierPaymentPage";
import SupplierPaymentForm from "../forms/ProductForms/SupplierPaymentForm";
import ProfitPage from "../pages/CompanyPages/ProfitPage";
import ProfitLogForm from "../forms/CompanyForms/ProfitLog_Form";
import AttendancePage from "../pages/UserPages/AttendancePage";
import BankTransferPage from "../pages/CompanyPages/BankTransferPage";
import BankTransferForm from "../forms/CompanyForms/BankTransfer_Form";
import AdvanceSalaryPage from "../pages/UserPages/AdvanceSalaryPage";
import AdvanceSalaryForm from "../forms/UserForms/AdvanceSalary_form";
import PackageGroupTable from "../pages/PackageGroupTable";
import BundlesPage from "../pages/ProductPages/BundlesPage";
import BundlesForm from "../forms/ProductForms/BundlesForm";
import DiscountForm from "../forms/ReceiptForms/Discount_form";
import DiscountPage from "../pages/ReceiptPages/DiscountPage";
import LPRPage from "../pages/CompanyPages/LoyaltyPointRules";
import LPRForm from "../forms/CompanyForms/LPR_Form";
import CLPForm from "../forms/CustomerForms/CLP_form";
import CLPPage from "../pages/CustomerPages/CLPPage";
import ExpensePage from "../pages/CompanyPages/ExpensePage";
import ExpenseForm from "../forms/CompanyForms/Expense_Form";
import ReviewPage from "../pages/CustomerPages/CustomerReviewPage";
import CustomerReview from "../forms/CustomerForms/CustomerReview_form";
import BankTransactionPage from "../pages/CompanyPages/BankTransactionPage";
import BankTransactionForm from "../forms/CompanyForms/BankTransaction_Form";
import AssetPage from "../pages/CompanyPages/AssetPage";
import AssetForm from "../forms/CompanyForms/Asset_Form";
import InventoryAdjustmentPage from "../pages/ProductPages/InventoryAdjustmentPage";
import InventoryAdjustment from "../forms/ProductForms/InventoryAdjustment_Form";
import InventoryTransferForm2 from "../forms/InventoryTransferFrom2";
import InventoryTransfer from "../pages/ProductPages/InventoryTransfer";
import OtherIncomeCategoryForm from "../forms/CompanyForms/OtherIncomeCategory_Form";
import OtherIncomeSourceCategoryPage from "../pages/CompanyPages/OtherIncomeSourceCategoryPage";
import OtherSourceOfIncomeForm from "../forms/CompanyForms/OtherSourceOfIncome_Form";
import OtherSourceOfIncomePage from "../pages/CompanyPages/OtherSourceOfIncomePage";
import ContractDocumentCategoryForm from "../forms/ProductForms/ContractDocumentCategory_Form";
import ContractDocumentCategoryPage from "../pages/ProductPages/ContractDocumentCategoriesPage";
import ContractDocument from "/src/pages/ProductPages/ContractDocumentPage";
import ContractDocumentForm from "/src/forms/ProductForms/ContractDocumentForm";
import CashierReceiptPage from "../pages/ReceiptPages/CashierReceiptPage";
import CashierReceiptForm from "../forms/ReceiptForms/CashierReceipt_form";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/test" element={<TestPage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route path="/companies" element={<CompanyPage />} />
        <Route path="/add-company" element={<CompanyForm mode="add" />} />
        <Route path="/update-company/:id" element={<CompanyForm mode="edit" />}/>

        
        <Route path="/LPRs" element={<LPRPage />} />
        <Route path="/add-LPR" element={<LPRForm mode="add" />} />
        <Route path="/update-LPR" element={<LPRForm mode="edit" />}/>


        <Route path="/expenses" element={<ExpensePage />} />
        <Route path="/add-expense" element={<ExpenseForm mode="add" />} />
        <Route path="/update-expense" element={<ExpenseForm mode="edit" />}/>


        

        <Route path="/assets" element={<AssetPage />} />
        <Route path="/add-asset" element={<AssetForm mode="add" />} />
        <Route path="/update-asset" element={<AssetForm mode="edit" />}/>

        
        <Route path="/banks" element={<BankPage />} />
        <Route path="/add-bank" element={<BankForm mode="add" />} />
        
        <Route path="/other-source-of-incomes" element={<OtherSourceOfIncomePage />} />
        <Route path="/add-other-source-of-income" element={<OtherSourceOfIncomeForm mode="add" />} />
        <Route path="/update-other-source-of-income" element={<OtherSourceOfIncomeForm mode="edit" />} />

        
        <Route path="/other-source-of-income-categories" element={<OtherIncomeSourceCategoryPage />} />
        <Route path="/add-other-source-of-income-category" element={<OtherIncomeCategoryForm mode="add" />} />
        <Route path="/update-other-source-of-income-category" element={<OtherIncomeCategoryForm mode="edit" />} />




        
        <Route path="/contract-documents-categories" element={<ContractDocumentCategoryPage />} />
        <Route path="/add-contract-documents-category" element={<ContractDocumentCategoryForm mode="add" />} />
        <Route path="/update-contract-documents-category" element={<ContractDocumentCategoryForm mode="edit" />} />

        
        <Route path="/contract-documents" element={<ContractDocument />} />
        <Route path="/add-contract-documents" element={<ContractDocumentForm mode="add" />} />
        <Route path="/update-contract-documents" element={<ContractDocumentForm mode="edit" />} />




        <Route path="/bank-transactions" element={<BankTransactionPage />} />
        <Route path="/add-bank-transaction" element={<BankTransactionForm mode="add" />} />


        
        <Route path="/bank-transfers" element={<BankTransferPage />} />
        <Route path="/add-bank-transfer" element={<BankTransferForm mode="add" />} />

        
        <Route path="/profit-logs" element={<ProfitPage />} />
        <Route path="/add-profit-log" element={<ProfitLogForm mode="add" />} />

        
        <Route path="/floors" element={<FloorList />} />
        <Route path="/add-floors" element={<FloorForm mode="add" />} />
        <Route path="/update-floor" element={<FloorForm mode="edit" />} />

        
        <Route path="/aisles" element={<AisleList />} />
        <Route path="/add-aisles" element={<AisleForm mode="add" />} />
        <Route path="/update-aisle" element={<AisleForm mode="edit" />} />

        
        <Route path="/sides" element={<SideList />} />
        <Route path="/add-sides" element={<SideForm mode="add" />} />
        <Route path="/update-side" element={<SideForm mode="edit" />} />

        
        <Route path="/branches" element={<BranchPage />} />
        <Route path="/add-branch" element={<BranchForm mode="add" />} />
        <Route path="/update-branch/:id" element={<BranchForm mode="edit" />}/>
        
        <Route path="/warehouses" element={<WarehousePage />} />
        <Route path="/add-warehouse" element={<WarehouseForm mode="add" />} />
        <Route path="/update-warehouse/:id" element={<WarehouseForm mode="edit" />}/>
        
        <Route path="/users" element={<UserPage />} />
        <Route path="/add-user" element={<SignupForm mode="add" />} />
        <Route path="/update-user/:id" element={<UserForm mode="edit" />}/>
        
        <Route path="/roles" element={<RolePage />} />
        <Route path="/add-role" element={<RoleForm mode="add" />} />
        <Route path="/update-role/:id" element={<RoleForm mode="edit" />}/>   
        
        <Route path="/shifts" element={<ShiftPage />} />
        <Route path="/add-shift" element={<ShiftForm mode="add" />} />
        <Route path="/update-shift/:id" element={<ShiftForm mode="edit" />}/>

        <Route path="/salaries" element={<SalaryPage />} />
        <Route path="/add-salary" element={<SalaryForm mode="add" />} />
        <Route path="/update-salary/:id" element={<SalaryForm mode="edit" />}/>

        
        <Route path="/advance-salaries" element={<AdvanceSalaryPage />} />
        <Route path="/add-advance-salary" element={<AdvanceSalaryForm mode="add" />} />
        <Route path="/update-advance-salary" element={<AdvanceSalaryForm mode="edit" />}/>


        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/add-attendance" element={<SalaryForm mode="add" />} />
        <Route path="/update-attendance/:id" element={<SalaryForm mode="edit" />}/>


        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/add-category" element={<CategoryForm mode="add" />} />
        <Route path="/update-category/:id" element={<CategoryForm mode="edit" />}/>

        <Route path="/suppliers" element={<SupplierPage />} />
        <Route path="/add-supplier" element={<SupplierForm mode="add" />} />
        <Route path="/update-supplier/:id" element={<SupplierForm mode="edit" />}/>

        <Route path="/products" element={<ProductPage />} />
        <Route path="/add-product" element={<ProductForm mode="add" />} />
        <Route path="/update-product/:id" element={<ProductForm mode="edit" />}/>
        
        <Route path="/inventories" element={<InventoryPage />} />
        <Route path="/add-inventory" element={<InventoryForm mode="add" />} />
        <Route path="/update-inventory/:id" element={<InventoryForm mode="edit" />}/>


        
      <Route path="/inventory-adjustment" element={<InventoryAdjustmentPage />} />
      <Route path="/add-inventory-adjustment" element={<InventoryAdjustment mode="add" />} />
      <Route path="/update-inventory-adjustment/:id" element={<InventoryAdjustment mode="edit" />}/>


        
        <Route path="/customers" element={<CustomerPage />} />
        <Route path="/add-customer" element={<CustomerForm mode="add" />} />
        <Route path="/update-customer/:id" element={<CustomerForm mode="edit" />}/>


        
        <Route path="/customer-reviews" element={<ReviewPage />} />
        <Route path="/add-customer-review" element={<CustomerReview mode="add" />} />
        <Route path="/update-customer-review/:id" element={<CustomerReview mode="edit" />}/>

        
        <Route path="/CLP" element={<CLPPage />} />
        <Route path="/add-CLP" element={<CLPForm mode="add" />} />
        <Route path="/update-CLP" element={<CLPForm mode="edit" />}/>


        <Route path="/customer-ledgers" element={<CustomerLedgerPage />} />
        <Route path="/add-customer-ledger" element={<CustomerRepayment mode="add" />} />
        <Route path="/update-customer-ledger/:id" element={<CustomerRepayment mode="edit" />}/>

        <Route path="/customer-payments" element={<CustomerPaymentsPage />} />
        <Route path="/add-customer-payment" element={<CustomerRepayment mode="add" />} />
        <Route path="/update-customer-payment/:id" element={<CustomerRepayment mode="edit" />}/>

        <Route path="/taxes" element={<TaxPage />} />
        <Route path="/add-tax" element={<TaxForm mode="add" />} />
        <Route path="/update-tax/:id" element={<TaxForm mode="edit" />}/>
        
        <Route path="/receipts" element={<ReceiptPage />} />
        <Route path="/add-receipt" element={<ReceiptForm mode="add" />} />
        <Route path="/update-receipt/:id" element={<ReceiptForm mode="edit" />}/>
        

        
        <Route path="/cashier-receipts" element={<CashierReceiptPage />} />
        <Route path="/add-cashier-receipt" element={<CashierReceiptForm mode="add" />} />
        <Route path="/update-cashier-receipt/:id" element={<CashierReceiptForm mode="edit" />}/>
        
        <Route path="/gift-cards" element={<GiftCardPage />} />
        <Route path="/add-gift-card" element={<GiftCardForm mode="add" />} />
        <Route path="/update-gift-card/:id" element={<GiftCardForm mode="edit" />}/>

        
        <Route path="/discounts" element={<DiscountPage />} />
        <Route path="/add-discount" element={<DiscountForm mode="add" />} />
        <Route path="/update-discount" element={<DiscountForm mode="edit" />}/>
        
        <Route path="/grns" element={<GRNPage />} />
        <Route path="/add-grn" element={<GRNForm mode="add" />} />
        <Route path="/update-grn/:id" element={<GRNForm mode="edit" />}/>

        <Route path="/purchase-orders" element={<PurchaseOrderPage/>}/>  
        <Route path="/add-purchase-order" element={<PurchaseOrderForm mode="add" />} />
        <Route path="/update-purchase-order/:id" element={<PurchaseOrderForm mode="edit" />}/>

        <Route path="/change-logs" element={<ChangeLogPage/>}/>  
        <Route path="/add-change-log" element={<ChangeLogForm mode="add" />} />
        <Route path="/update-change-log/:id" element={<ChangeLogForm mode="edit" />}/>

        
        <Route path="/ingredients" element={<IngredientsPage/>}/>  
        <Route path="/add-ingredient" element={<IngredientsForm mode="add" />} />
        <Route path="/update-ingredient/:id" element={<IngredientsForm mode="edit" />}/>


        <Route path="/bundles" element={<BundlesPage/>}/>  
        <Route path="/add-bundle" element={<BundlesForm mode="add" />} />
        <Route path="/update-bundle/:id" element={<BundlesForm mode="edit" />}/>

        
        <Route path="/alerts" element={<AlertPage />}/>  
        <Route path="/add-alert" element={<AlertForm mode="add" />} />
        <Route path="/update-alert/:id" element={<AlertForm mode="edit" />}/>

        <Route path="/warnings" element={<WarningPage />}/>  
        <Route path="/add-warning" element={<WarningForm mode="add" />} />
        <Route path="/update-warning/:id" element={<WarningForm mode="edit" />}/>

        <Route path="/tasks" element={<TaskPage />}/>  
        <Route path="/add-task" element={<TaskForm mode="add" />} />
        <Route path="/update-task/:id" element={<TaskForm mode="edit" />}/>

        <Route path="/pack-open-product" element={<PackOpenProduct/>}/>  
        <Route path="/pack" element={ <PackageGroupTable />}/>  
        <Route path="/pack-open-product-page" element={<PackOpenProducts/>}/>  

        <Route path="/supplier-invoices" element={<SupplierInvoicePage/>}/>  
        <Route path="/add-supplier-invoice" element={<SupplierInvoiceForm mode="add" />} />
        <Route path="/update-supplier-invoice/:id" element={<SupplierInvoiceForm mode="edit" />}/>

        
        <Route path="/supplier-ledgers" element={<SupplierLedgerPage/>}/>  
        <Route path="/add-supplier-ledger" element={<SupplierInvoiceForm mode="add" />} />
        <Route path="/update-supplier-ledger/:id" element={<SupplierInvoiceForm mode="edit" />}/>

        
        
        <Route path="/supplier-payments" element={<SupplierPaymentPage/>}/>  
        <Route path="/add-supplier-payment" element={<SupplierPaymentForm mode="add" />} />
        <Route path="/update-supplier-payment/:id" element={<SupplierPaymentForm mode="edit" />}/>

        <Route path="/add-homemade-product" element={<HomeMadeProductsForm mode="add" />} />
        <Route path="/update-homemade-product/:id" element={<HomeMadeProductsForm mode="edit" />}/>
        <Route path="/price-checker" element={<PriceChecker mode="edit" />}/>
        <Route path="/add-inventory-transfer" element={<InventoryTransferForm2/>}/>
        <Route path="/inventory-transfer" element={<InventoryTransfer/>}/>



        <Route path="/add" element={<MultiSelectForm />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </Router>
);

export default AppRoutes;
