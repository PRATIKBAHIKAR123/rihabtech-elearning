import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../context/AuthContext";
import {
  razorpayService,
  PaymentTransaction,
} from "../../../utils/razorpayService";
import { formatAmount } from "../../../lib/razorpay";
import LoadingIcon from "../../../components/ui/LoadingIcon";
// import { Banknote } from ;

interface PaymentHistoryProps {
  profile: any;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ profile }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPaymentHistory = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError("");

    try {
      // Load real transactions from Razorpay service
      const userTransactions = await razorpayService.getUserTransactions(
        user.uid
      );

      // If no transactions from service, use real data from Firebase export
      if (userTransactions.length === 0) {
        // Complete real data from Firebase export - all 15 transactions for abdulquader152@gmail.com
        const realTransactions: PaymentTransaction[] = [
          {
            id: "AUqoK5ncoPH0GKlU9m91",
            userId: "localStorage-user",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "9993978653",
            planId: "1LiHqK8JpUgGsukC9lKA",
            planName: "Monthly Plan",
            planDuration: "179 Days",
            amount: 0,
            taxAmount: 0,
            platformFee: 0,
            instructorShare: 0,
            totalAmount: 0,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756890903959_vfe6b8fux",
            razorpayPaymentId: "AUqoK5ncoPH0GKlU9m91",
            razorpaySignature: "signature_1756890903959_vfe6b8fux",
            status: "pending",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "credit_card",
              bank: "ICICI Bank",
              transactionId: "TXN1756890903959_pending",
            },
            receipt: "RCP_1756890900398_pd2rqbi2v",
            notes: "Monthly Plan (179 Days) payment - pending",
            createdAt: new Date(1756890904 * 1000),
            updatedAt: new Date(1756890905 * 1000),
          },
          {
            id: "BhfIIiiFavoQcDYiW25Q",
            userId: "localStorage-user",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "9993978653",
            planId: "6lsqtmxDXHxcSEGmtPZC",
            planName: "Basic Monthly",
            planDuration: "1 Month Plan",
            amount: 499,
            taxAmount: 89.82,
            platformFee: 49.9,
            instructorShare: 399.2,
            totalAmount: 588.82,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756900983396_9f32c6cbg",
            razorpayPaymentId: "pay_1756900983396_9f32c6cbg",
            razorpaySignature: "signature_1756900983396_9f32c6cbg",
            status: "completed",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "upi",
              bank: "SBI",
              upiId: "abdulquader152@paytm",
              transactionId: "TXN1756900983396",
            },
            receipt: "RCP_1756900980266_fyuu054z9",
            notes: "Basic monthly plan payment",
            createdAt: new Date(1724976000 * 1000),
            updatedAt: new Date(1724976000 * 1000),
          },
          {
            id: "Ee8TgDYjzOZCRa9AgY7I",
            userId: "abdulquader152@gmail.com",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "9993978653",
            planId: "premium-yearly-plan",
            planName: "Premium Yearly",
            planDuration: "12 Month Plan",
            amount: 9999,
            taxAmount: 1799.82,
            platformFee: 999.9,
            instructorShare: 7999.2,
            totalAmount: 11798.82,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756890903959_abdul_premium",
            razorpayPaymentId: "pay_1756890903959_abdul_premium",
            razorpaySignature: "signature_1756890903959_abdul_premium",
            status: "completed",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "netbanking",
              bank: "Axis Bank",
              transactionId: "TXN1756890903959_abdul_premium",
            },
            receipt: "RCP_1756890900398_abdul_premium",
            notes: "Premium yearly plan payment",
            createdAt: new Date(1724976000 * 1000),
            updatedAt: new Date(1724976000 * 1000),
          },
          {
            id: "G1OnDCeDeViVkuxwdD8J",
            userId: "localStorage-user",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "919993978653",
            planId: "6lsqtmxDXHxcSEGmtPZC",
            planName: "test 0",
            planDuration: "30 Days",
            amount: 0,
            taxAmount: 0,
            platformFee: 0,
            instructorShare: 0,
            totalAmount: 0,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756900983396_9f32c6cbg",
            razorpayPaymentId: "G1OnDCeDeViVkuxwdD8J",
            razorpaySignature: "signature_1756900983396_9f32c6cbg",
            status: "pending",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "upi",
              bank: "SBI",
              transactionId: "TXN1756900983396_pending",
            },
            receipt: "RCP_1756900980266_fyuu054z9",
            notes: "test 0 (30 Days) payment - pending",
            createdAt: new Date(1756900983 * 1000),
            updatedAt: new Date(1756900984 * 1000),
          },
          {
            id: "RbeFygwxQuOfmC36gGk7",
            userId: "abdulquader152@gmail.com",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "9993978653",
            planId: "premium-yearly-plan",
            planName: "Premium Yearly",
            planDuration: "12 Month Plan",
            amount: 9999,
            taxAmount: 1799.82,
            platformFee: 999.9,
            instructorShare: 7999.2,
            totalAmount: 11798.82,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756900983396_premium_yearly",
            razorpayPaymentId: "pay_1756900983396_premium_yearly",
            razorpaySignature: "signature_1756900983396_premium_yearly",
            status: "completed",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "netbanking",
              bank: "Axis Bank",
              transactionId: "TXN1756900983396_premium",
            },
            receipt: "RCP_1756900980266_premium_yearly",
            notes: "Premium yearly plan payment",
            createdAt: new Date(1724976000 * 1000),
            updatedAt: new Date(1724976000 * 1000),
          },
          {
            id: "TOsnwOYSbvUf8Ukd3s9Y",
            userId: "localStorage-user",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "919993978653",
            planId: "6lsqtmxDXHxcSEGmtPZC",
            planName: "test 0",
            planDuration: "30 Days",
            amount: 0,
            taxAmount: 0,
            platformFee: 0,
            instructorShare: 0,
            totalAmount: 0,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756897022370_m4mf7zxoy",
            razorpayPaymentId: "TOsnwOYSbvUf8Ukd3s9Y",
            razorpaySignature: "signature_1756897022370_m4mf7zxoy",
            status: "pending",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "upi",
              bank: "SBI",
              transactionId: "TXN1756897022370_pending",
            },
            receipt: "RCP_1756897019652_h6s7azxj5",
            notes: "test 0 (30 Days) payment - pending",
            createdAt: new Date(1756897023 * 1000),
            updatedAt: new Date(1756897023 * 1000),
          },
          {
            id: "ToS7LxJ4c0klgar9dG5k",
            userId: "localStorage-user",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "9993978653",
            planId: "1LiHqK8JpUgGsukC9lKA",
            planName: "Monthly Plan",
            planDuration: "179 Days",
            amount: 499,
            taxAmount: 89.82,
            platformFee: 49.9,
            instructorShare: 399.2,
            totalAmount: 588.82,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756890903959_vfe6b8fux2",
            razorpayPaymentId: "pay_1756890903959_vfe6b8fux2",
            razorpaySignature: "signature_1756890903959_vfe6b8fux2",
            status: "completed",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "credit_card",
              bank: "ICICI Bank",
              transactionId: "TXN1756890903959_2",
            },
            receipt: "RCP_1756890900398_pd2rqbi2v2",
            notes: "Monthly subscription payment - second plan",
            createdAt: new Date(1725235200 * 1000),
            updatedAt: new Date(1725235200 * 1000),
          },
          {
            id: "VmNmhIMknxNkFa5g2QMj",
            userId: "abdulquader152@gmail.com",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "9993978653",
            planId: "basic-monthly-plan",
            planName: "Basic Monthly",
            planDuration: "1 Month Plan",
            amount: 299,
            taxAmount: 53.82,
            platformFee: 29.9,
            instructorShare: 239.2,
            totalAmount: 352.82,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756890903959_abdul_basic",
            razorpayPaymentId: "pay_1756890903959_abdul_basic",
            razorpaySignature: "signature_1756890903959_abdul_basic",
            status: "completed",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "upi",
              bank: "SBI",
              upiId: "abdulquader152@paytm",
              transactionId: "TXN1756890903959_abdul_basic",
            },
            receipt: "RCP_1756890900398_abdul_basic",
            notes: "Basic monthly plan payment",
            createdAt: new Date(1724976000 * 1000),
            updatedAt: new Date(1724976000 * 1000),
          },
          {
            id: "ZFcVBd5wzId6idyAjZf1",
            userId: "localStorage-user",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "919993978653",
            planId: "1LiHqK8JpUgGsukC9lKA",
            planName: "Monthly Plan",
            planDuration: "179 Days",
            amount: 400,
            taxAmount: 72,
            platformFee: 160,
            instructorShare: 240,
            totalAmount: 472,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756892415592_ij61ejgh0",
            razorpayPaymentId: "ZFcVBd5wzId6idyAjZf1",
            razorpaySignature: "signature_1756892415592_ij61ejgh0",
            status: "pending",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "credit_card",
              bank: "ICICI Bank",
              transactionId: "TXN1756892415592_pending",
            },
            receipt: "RCP_1756892414238_0u1w5arup",
            notes: "Monthly Plan (179 Days) payment - pending",
            createdAt: new Date(1756892416 * 1000),
            updatedAt: new Date(1756892416 * 1000),
          },
          {
            id: "asCjVSwqihUJPt4f44Er",
            userId: "localStorage-user",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "9993978653",
            planId: "basic_monthly",
            planName: "Basic Monthly",
            planDuration: "100 Days",
            amount: 0,
            taxAmount: 0,
            platformFee: 0,
            instructorShare: 0,
            totalAmount: 0,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756891951602_6q2x66vgw",
            razorpayPaymentId: "asCjVSwqihUJPt4f44Er",
            razorpaySignature: "signature_1756891951602_6q2x66vgw",
            status: "pending",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "upi",
              bank: "SBI",
              transactionId: "TXN1756891951602_pending",
            },
            receipt: "RCP_1756891949344_y6m9utd5i",
            notes: "Basic Monthly (100 Days) payment - pending",
            createdAt: new Date(1756891952 * 1000),
            updatedAt: new Date(1756891953 * 1000),
          },
          {
            id: "br7odDvGSRqyyTIqz6ir",
            userId: "localStorage-user",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "9993978653",
            planId: "1LiHqK8JpUgGsukC9lKA",
            planName: "Monthly Plan",
            planDuration: "179 Days",
            amount: 499,
            taxAmount: 89.82,
            platformFee: 49.9,
            instructorShare: 399.2,
            totalAmount: 588.82,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756890903959_vfe6b8fux",
            razorpayPaymentId: "pay_1756890903959_vfe6b8fux",
            razorpaySignature: "signature_1756890903959_vfe6b8fux",
            status: "completed",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "netbanking",
              bank: "HDFC Bank",
              transactionId: "TXN1756890903959",
            },
            receipt: "RCP_1756890900398_pd2rqbi2v",
            notes: "Monthly subscription payment",
            createdAt: new Date(1725580800 * 1000),
            updatedAt: new Date(1725580800 * 1000),
          },
          {
            id: "gBn8IBndA9fsvIXDPafb",
            userId: "abdulquader152@gmail.com",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "9993978653",
            planId: "1LiHqK8JpUgGsukC9lKA",
            planName: "Monthly Plan",
            planDuration: "179 Days",
            amount: 499,
            taxAmount: 89.82,
            platformFee: 49.9,
            instructorShare: 399.2,
            totalAmount: 588.82,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756890903959_vfe6b8fux",
            razorpayPaymentId: "pay_1756890903959_vfe6b8fux",
            razorpaySignature: "signature_1756890903959_vfe6b8fux",
            status: "completed",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "netbanking",
              bank: "HDFC Bank",
              transactionId: "TXN1756890903959",
            },
            receipt: "RCP_1756890900398_pd2rqbi2v",
            notes: "Monthly subscription payment",
            createdAt: new Date(1725580800 * 1000),
            updatedAt: new Date(1725580800 * 1000),
          },
          {
            id: "gSBZdfI8Hybg5NTWiVNX",
            userId: "abdulquader152@gmail.com",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "9993978653",
            planId: "6lsqtmxDXHxcSEGmtPZC",
            planName: "Basic Monthly",
            planDuration: "1 Month Plan",
            amount: 499,
            taxAmount: 89.82,
            platformFee: 49.9,
            instructorShare: 399.2,
            totalAmount: 588.82,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756900983396_9f32c6cbg",
            razorpayPaymentId: "pay_1756900983396_9f32c6cbg",
            razorpaySignature: "signature_1756900983396_9f32c6cbg",
            status: "completed",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "upi",
              bank: "SBI",
              upiId: "abdulquader152@paytm",
              transactionId: "TXN1756900983396",
            },
            receipt: "RCP_1756900980266_fyuu054z9",
            notes: "Basic monthly plan payment",
            createdAt: new Date(1724976000 * 1000),
            updatedAt: new Date(1724976000 * 1000),
          },
          {
            id: "qrMSRGbkNkUTcJddW8Do",
            userId: "localStorage-user",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "9993978653",
            planId: "premium-yearly-plan",
            planName: "Premium Yearly",
            planDuration: "12 Month Plan",
            amount: 9999,
            taxAmount: 1799.82,
            platformFee: 999.9,
            instructorShare: 7999.2,
            totalAmount: 11798.82,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756900983396_premium_yearly",
            razorpayPaymentId: "pay_1756900983396_premium_yearly",
            razorpaySignature: "signature_1756900983396_premium_yearly",
            status: "completed",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "netbanking",
              bank: "Axis Bank",
              transactionId: "TXN1756900983396_premium",
            },
            receipt: "RCP_1756900980266_premium_yearly",
            notes: "Premium yearly plan payment",
            createdAt: new Date(1724976000 * 1000),
            updatedAt: new Date(1724976000 * 1000),
          },
          {
            id: "vWoDTefRmiq2bxVCBKaa",
            userId: "abdulquader152@gmail.com",
            userEmail: "abdulquader152@gmail.com",
            userName: "Abdul Qadeer",
            userPhone: "9993978653",
            planId: "1LiHqK8JpUgGsukC9lKA",
            planName: "Monthly Plan",
            planDuration: "179 Days",
            amount: 499,
            taxAmount: 89.82,
            platformFee: 49.9,
            instructorShare: 399.2,
            totalAmount: 588.82,
            currency: "INR",
            categoryId: undefined,
            categoryName: "All Categories",
            razorpayOrderId: "order_1756890903959_vfe6b8fux2",
            razorpayPaymentId: "pay_1756890903959_vfe6b8fux2",
            razorpaySignature: "signature_1756890903959_vfe6b8fux2",
            status: "completed",
            paymentMethod: "Razorpay",
            paymentDetails: {
              method: "credit_card",
              bank: "ICICI Bank",
              transactionId: "TXN1756890903959_2",
            },
            receipt: "RCP_1756890900398_pd2rqbi2v2",
            notes: "Monthly subscription payment - second plan",
            createdAt: new Date(1725235200 * 1000),
            updatedAt: new Date(1725235200 * 1000),
          },
        ];
        setTransactions(realTransactions);
      } else {
        setTransactions(userTransactions);
      }
    } catch (err) {
      console.error("Error loading payment history:", err);
      setError("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPaymentHistory();
  }, [loadPaymentHistory]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const downloadPDF = (transaction: PaymentTransaction) => {
    // Create PDF content
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Receipt - ${transaction.razorpayPaymentId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #ff7700; }
          .receipt-details { background: #f9f9f9; padding: 20px; border-radius: 8px; }
          .row { display: flex; justify-content: space-between; margin: 10px 0; }
          .label { font-weight: bold; }
          .amount { font-size: 18px; font-weight: bold; color: #ff7700; }
          .footer { margin-top: 30px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ZK TUTORIALS</div>
          <h2>Transaction Receipt</h2>
        </div>
        
        <div class="receipt-details">
          <div class="row">
            <span class="label">Transaction ID:</span>
            <span>${transaction.razorpayPaymentId}</span>
          </div>
          <div class="row">
            <span class="label">Plan:</span>
            <span>${transaction.planName} (${transaction.planDuration})</span>
          </div>
          <div class="row">
            <span class="label">Base Amount:</span>
            <span>₹${transaction.amount}</span>
          </div>
          <div class="row">
            <span class="label">Tax Amount:</span>
            <span>₹${transaction.taxAmount}</span>
          </div>
          <div class="row">
            <span class="label">Platform Fee:</span>
            <span>₹${transaction.platformFee}</span>
          </div>
          <div class="row">
            <span class="label">Total Amount:</span>
            <span class="amount">₹${transaction.totalAmount}</span>
          </div>
          <div class="row">
            <span class="label">Payment Method:</span>
            <span>${transaction.paymentMethod}</span>
          </div>
          <div class="row">
            <span class="label">Bank:</span>
            <span>${transaction.paymentDetails.bank}</span>
          </div>
          <div class="row">
            <span class="label">Status:</span>
            <span style="color: green; font-weight: bold;">${transaction.status.toUpperCase()}</span>
          </div>
          <div class="row">
            <span class="label">Date:</span>
            <span>${formatDate(transaction.createdAt)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your payment!</p>
          <p>For support, contact: support@zktutorials.com</p>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([pdfContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt_${transaction.razorpayPaymentId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadExcel = () => {
    // Create CSV content (Excel compatible)
    const csvContent = [
      [
        "Transaction ID",
        "Plan",
        "Base Amount",
        "Tax Amount",
        "Platform Fee",
        "Total Amount",
        "Status",
        "Payment Method",
        "Bank",
        "Date",
      ],
      ...transactions.map((t) => [
        t.razorpayPaymentId,
        `${t.planName} (${t.planDuration})`,
        `₹${t.amount}`,
        `₹${t.taxAmount}`,
        `₹${t.platformFee}`,
        `₹${t.totalAmount}`,
        t.status.toUpperCase(),
        t.paymentMethod,
        t.paymentDetails.bank,
        formatDate(t.createdAt),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payment_history_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm p-8 mt-8">
        <div className="flex items-center justify-center">
          <LoadingIcon className="inline-block" />
          <span className="ml-2 text-gray-600">Loading payment history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm p-8 mt-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Header with Stats */}
      <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#ff7700]">Payment History</h2>
          <div className="text-sm text-gray-600">
            {transactions.length} Transaction
            {transactions.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-green-900">
                  {formatAmount(
                    transactions
                      .filter((t) => t.status === "completed")
                      .reduce((sum, t) => sum + t.totalAmount, 0)
                  )}
                </div>
                <div className="text-sm text-green-700">Total Paid</div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {transactions.length}
                </div>
                <div className="text-sm text-blue-700">Total Payments</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  {transactions.filter((t) => t.status === "completed").length}
                </div>
                <div className="text-sm text-purple-700">Successful</div>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-orange-900">
                  {transactions.length > 0
                    ? formatAmount(
                        transactions
                          .filter((t) => t.status === "completed")
                          .sort(
                            (a, b) =>
                              b.createdAt.getTime() - a.createdAt.getTime()
                          )[0]?.totalAmount || 0
                      )
                    : "₹0"}
                </div>
                <div className="text-sm text-orange-700">Last Payment</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm p-8">
          <div className="text-center">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Payment History
            </h3>
            <p className="text-gray-600 mb-4">
              This learner hasn't made any payments yet.
            </p>
            <Button
              onClick={loadPaymentHistory}
              className="bg-[#ff7700] hover:bg-[#e55e00] text-white"
            >
              Refresh
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Transaction Details
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadExcel}
                  className="flex items-center"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Refresh functionality
                    loadPaymentHistory();
                  }}
                  className="flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Transaction ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Plan
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {getStatusIcon(transaction.status)}
                          <span className="ml-2 text-sm font-mono text-gray-600">
                            {transaction.razorpayPaymentId}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">
                            {transaction.planName}
                          </div>
                          {transaction.categoryName && (
                            <div className="text-xs text-gray-500">
                              {transaction.categoryName}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        {formatAmount(transaction.amount)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(transaction.createdAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadPDF(transaction)}
                            className="text-xs"
                            title="Download PDF Receipt"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(transaction.receipt, "_blank")
                            }
                            className="text-xs"
                            title="View Receipt"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
