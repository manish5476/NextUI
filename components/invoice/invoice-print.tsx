"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Download, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import QRCode from "qrcode"

interface InvoiceItem {
  id: string
  title: string
  hsnSac?: string
  quantity: number
  rate: number
  discount: number
  taxableValue: number
  gstRate: number
  gstAmount: number
  amount: number
}

interface BuyerDetails {
  fullname: string
  gstin?: string
  addresses?: Array<{
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }>
}

interface InvoiceData {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  buyerDetails: BuyerDetails
  items: InvoiceItem[]
  itemDetails: Array<{ title: string }>
  subTotal: number
  totalDiscount: number
  gst: number
  cess: number
  totalAmount: number
  notes?: string
  upiId?: string
}

interface InvoicePrintProps {
  invoiceData: InvoiceData
  showPreview?: boolean
  onClose?: () => void
}

export function InvoicePrint({ invoiceData, showPreview = false, onClose }: InvoicePrintProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const invoiceRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    generateQRCode()
  }, [invoiceData])

  const generateQRCode = async () => {
    try {
      const upiString = `upi://pay?pa=${invoiceData.upiId || "contact@shivamelectronics.com"}&pn=Shivam Electronics&am=${invoiceData.totalAmount}&cu=INR&tn=Invoice ${invoiceData.invoiceNumber}`
      const qrUrl = await QRCode.toDataURL(upiString, {
        width: 200,
        scale: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      })
      setQrCodeUrl(qrUrl)
    } catch (error) {
      console.error("Error generating QR Code:", error)
    }
  }

  const convertNumberToWords = (num: number): string => {
    if (!num) return ""

    const ones = [
      "Zero",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ]

    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    function convertToWords(n: number): string {
      if (n < 20) return ones[n]
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "")
      if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convertToWords(n % 100) : "")
      if (n < 100000)
        return convertToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convertToWords(n % 1000) : "")
      if (n < 10000000)
        return convertToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convertToWords(n % 100000) : "")
      if (n < 1000000000)
        return (
          convertToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convertToWords(n % 10000000) : "")
        )
      return "Number too large"
    }

    return convertToWords(Math.round(num))
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const addAdvertisementPage = (pdf: jsPDF) => {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Background gradient effect
    pdf.setFillColor(245, 247, 250)
    pdf.rect(0, 0, pageWidth, pageHeight, "F")

    // Header with decorative border
    pdf.setFillColor(0, 102, 204)
    pdf.rect(0, 0, pageWidth, 1.5, "F")

    // Company Logo Area (placeholder)
    pdf.setFillColor(255, 255, 255)
    pdf.roundedRect(pageWidth / 2 - 1, 0.3, 2, 0.8, 0.1, 0.1, "F")
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(14)
    pdf.setTextColor(0, 102, 204)
    pdf.text("SHIVAM", pageWidth / 2, 0.6, { align: "center" })
    pdf.text("ELECTRONICS", pageWidth / 2, 0.8, { align: "center" })

    // Main Company Header
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(36)
    pdf.setTextColor(0, 102, 204)
    pdf.text("Shivam Electronics", pageWidth / 2, 2.0, { align: "center" })

    // Tagline with decorative elements
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "italic")
    pdf.setTextColor(100, 100, 100)
    pdf.text("Your Trusted Electronics Partner Since 2008", pageWidth / 2, 2.3, { align: "center" })

    // Decorative line
    pdf.setDrawColor(0, 102, 204)
    pdf.setLineWidth(0.03)
    pdf.line(1, 2.5, pageWidth - 1, 2.5)

    // Contact Information in styled box
    pdf.setFillColor(248, 249, 250)
    pdf.roundedRect(0.5, 2.7, pageWidth - 1, 0.8, 0.1, 0.1, "F")
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(50, 50, 50)
    pdf.text("📍 F-8, JB Shopping Center, Jolwa, Gujarat, India", pageWidth / 2, 3.0, { align: "center" })
    pdf.text("📞 +91 98765 43210 | ✉️ contact@shivamelectronics.com", pageWidth / 2, 3.2, { align: "center" })
    pdf.text("🌐 www.shivamelectronics.com", pageWidth / 2, 3.4, { align: "center" })

    // Smartphone Brands Section
    pdf.setFontSize(20)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(0, 102, 204)
    pdf.text("📱 Premium Smartphone Brands", pageWidth / 2, 4.0, { align: "center" })

    const smartphoneBrands = [
      "🍎 Apple",
      "📱 Samsung",
      "🔥 Xiaomi",
      "⚡ OnePlus",
      "🌟 Vivo",
      "💎 Oppo",
      "🚀 Realme",
      "🏆 Redmi",
      "📲 Huawei",
      "🎯 Nothing",
      "⭐ Motorola",
      "🔋 Infinix",
    ]

    let y = 4.3
    smartphoneBrands.forEach((brand, index) => {
      const x = (index % 4) * (pageWidth / 4) + pageWidth / 8
      if (index % 4 === 0 && index > 0) y += 0.4

      // Brand box
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(x - 0.8, y - 0.15, 1.6, 0.3, 0.05, 0.05, "F")
      pdf.setDrawColor(220, 220, 220)
      pdf.setLineWidth(0.01)
      pdf.roundedRect(x - 0.8, y - 0.15, 1.6, 0.3, 0.05, 0.05, "S")

      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(50, 50, 50)
      pdf.text(brand, x, y, { align: "center" })
    })

    // Home Appliances Section
    pdf.setFontSize(20)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(0, 102, 204)
    pdf.text("🏠 Home Appliances & Electronics", pageWidth / 2, y + 0.8, { align: "center" })

    const applianceBrands = [
      "❄️ Whirlpool",
      "⚡ Havells",
      "🌟 LG",
      "🔥 Voltas",
      "💨 Blue Star",
      "🌀 Crompton",
      "⭐ Bajaj",
      "🏆 Usha",
      "🔌 Anchor",
      "💡 Philips",
      "🎵 Sony",
      "📺 TCL",
    ]

    y += 1.1
    applianceBrands.forEach((brand, index) => {
      const x = (index % 4) * (pageWidth / 4) + pageWidth / 8
      if (index % 4 === 0 && index > 0) y += 0.4

      // Brand box
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(x - 0.8, y - 0.15, 1.6, 0.3, 0.05, 0.05, "F")
      pdf.setDrawColor(220, 220, 220)
      pdf.setLineWidth(0.01)
      pdf.roundedRect(x - 0.8, y - 0.15, 1.6, 0.3, 0.05, 0.05, "S")

      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(50, 50, 50)
      pdf.text(brand, x, y, { align: "center" })
    })

    // Services Section
    pdf.setFontSize(18)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(0, 102, 204)
    pdf.text("🔧 Our Premium Services", pageWidth / 2, y + 0.8, { align: "center" })

    const services = [
      "📱 Mobile & Laptop Repair",
      "🏠 Home Appliance Service",
      "⚡ Electrical Installation",
      "🎵 Audio/Video Setup",
      "💡 LED & Lighting Solutions",
      "🔋 Battery Replacement",
    ]

    y += 1.1
    services.forEach((service, index) => {
      const x = index % 2 === 0 ? pageWidth / 4 : (3 * pageWidth) / 4
      if (index % 2 === 0 && index > 0) y += 0.3

      pdf.setFontSize(11)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(50, 50, 50)
      pdf.text(service, x, y, { align: "center" })
    })

    // Customer Testimonials with decorative boxes
    pdf.setFontSize(18)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(0, 102, 204)
    pdf.text("💬 What Our Customers Say", pageWidth / 2, y + 0.8, { align: "center" })

    const testimonials = [
      {
        name: "Rahul Patel",
        quote: "Outstanding service! Fixed my laptop in no time. Highly recommended!",
        rating: "⭐⭐⭐⭐⭐",
      },
      {
        name: "Priya Sharma",
        quote: "Best electronics store in the area. Great prices and genuine products.",
        rating: "⭐⭐⭐⭐⭐",
      },
      {
        name: "Amit Kumar",
        quote: "Professional service and quick delivery. Will definitely come back!",
        rating: "⭐⭐⭐⭐⭐",
      },
    ]

    y += 1.2
    testimonials.forEach((testimonial, index) => {
      // Testimonial box with shadow effect
      pdf.setFillColor(248, 249, 250)
      pdf.roundedRect(0.5, y - 0.1, pageWidth - 1, 0.7, 0.1, 0.1, "F")
      pdf.setDrawColor(230, 230, 230)
      pdf.setLineWidth(0.01)
      pdf.roundedRect(0.5, y - 0.1, pageWidth - 1, 0.7, 0.1, 0.1, "S")

      pdf.setFontSize(10)
      pdf.setFont("helvetica", "italic")
      pdf.setTextColor(60, 60, 60)
      pdf.text(`"${testimonial.quote}"`, pageWidth / 2, y + 0.15, {
        align: "center",
        maxWidth: pageWidth - 1.5,
      })

      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(0, 102, 204)
      pdf.text(`${testimonial.rating} - ${testimonial.name}`, pageWidth / 2, y + 0.4, { align: "center" })

      y += 0.9
    })

    // Special Offers Section with attractive styling
    pdf.setFillColor(220, 20, 60)
    pdf.roundedRect(0.5, y + 0.2, pageWidth - 1, 1.2, 0.1, 0.1, "F")

    pdf.setFontSize(18)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(255, 255, 255)
    pdf.text("🎉 SPECIAL OFFERS THIS MONTH! 🎉", pageWidth / 2, y + 0.5, { align: "center" })

    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.text("• 10% OFF on all Mobile Accessories", pageWidth / 2, y + 0.8, { align: "center" })
    pdf.text("• Free Home Delivery on orders above ₹2000", pageWidth / 2, y + 1.0, { align: "center" })
    pdf.text("• Extended Warranty on Electronics", pageWidth / 2, y + 1.2, { align: "center" })

    // Footer with decorative elements
    pdf.setFillColor(0, 102, 204)
    pdf.rect(0, pageHeight - 1.0, pageWidth, 1.0, "F")

    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(255, 255, 255)
    pdf.text("Thank You for Choosing Shivam Electronics!", pageWidth / 2, pageHeight - 0.7, { align: "center" })

    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.text("Quality • Trust • Service Excellence Since 2008", pageWidth / 2, pageHeight - 0.5, { align: "center" })
    pdf.text("Follow us on social media for latest updates and exclusive offers", pageWidth / 2, pageHeight - 0.3, {
      align: "center",
    })

    pdf.addPage()
  }

  const downloadPDF = async () => {
    if (!invoiceRef.current) return

    setIsGenerating(true)
    try {
      const element = invoiceRef.current
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "a4",
      })

      // Add advertisement page first
      addAdvertisementPage(pdf)

      // Add invoice page
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height / canvas.width) * pdfWidth

      // Check if content fits on one page, if not, handle pagination
      const pageHeight = pdf.internal.pageSize.getHeight()
      if (pdfHeight > pageHeight) {
        // Split content across multiple pages if needed
        let remainingHeight = pdfHeight
        let sourceY = 0

        while (remainingHeight > 0) {
          const pageCanvas = document.createElement("canvas")
          const pageContext = pageCanvas.getContext("2d")!
          const currentPageHeight = Math.min(remainingHeight, pageHeight)

          pageCanvas.width = canvas.width
          pageCanvas.height = (currentPageHeight / pdfHeight) * canvas.height

          pageContext.drawImage(
            canvas,
            0,
            (sourceY / pdfHeight) * canvas.height,
            canvas.width,
            pageCanvas.height,
            0,
            0,
            canvas.width,
            pageCanvas.height,
          )

          const pageImgData = pageCanvas.toDataURL("image/jpeg", 1.0)
          pdf.addImage(pageImgData, "JPEG", 0, 0, pdfWidth, currentPageHeight)

          remainingHeight -= currentPageHeight
          sourceY += currentPageHeight

          if (remainingHeight > 0) {
            pdf.addPage()
          }
        }
      } else {
        const imgData = canvas.toDataURL("image/jpeg", 1.0)
        pdf.addImage(imgData, "JPEG", 0, 0.2, pdfWidth, pdfHeight)
      }

      pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`)

      toast({
        title: "Success",
        description: "Invoice PDF downloaded successfully",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const InvoiceContent = () => (
    <div ref={invoiceRef} className="invoice-container bg-white p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="seller-info">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Shivam Electronics</h2>
          <p className="text-sm text-gray-600">F-8 JB Shopping Center Jolwa</p>
          <p className="text-sm text-gray-600">Gujarat, India</p>
          <p className="text-sm text-gray-600">Phone: +91 98765 43210</p>
          <p className="text-sm text-gray-600">Email: contact@shivamelectronics.com</p>
        </div>
        <div className="invoice-details text-right">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">INVOICE</h1>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 font-semibold">Invoice No: {invoiceData.invoiceNumber}</p>
            <p className="text-gray-700">Date: {formatDate(invoiceData.invoiceDate)}</p>
            <p className="text-gray-700">Due Date: {formatDate(invoiceData.dueDate)}</p>
          </div>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Buyer Details */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Bill To</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-700">
              <strong className="font-semibold">Name:</strong> {invoiceData.buyerDetails.fullname}
            </p>
            <p className="text-gray-700">
              <strong className="font-semibold">GSTIN:</strong> {invoiceData.buyerDetails.gstin || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-700">
              <strong className="font-semibold">Address:</strong>
              {invoiceData.buyerDetails.addresses?.[0] && (
                <>
                  {" "}
                  {invoiceData.buyerDetails.addresses[0].street}, {invoiceData.buyerDetails.addresses[0].city},{" "}
                  {invoiceData.buyerDetails.addresses[0].state}, {invoiceData.buyerDetails.addresses[0].country},{" "}
                  {invoiceData.buyerDetails.addresses[0].zipCode}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-blue-50">
            <tr>
              <th className="border border-gray-300 px-3 py-3 text-left text-xs font-semibold text-gray-700">Sr.</th>
              <th className="border border-gray-300 px-3 py-3 text-left text-xs font-semibold text-gray-700">
                Item Description
              </th>
              <th className="border border-gray-300 px-3 py-3 text-left text-xs font-semibold text-gray-700">
                HSN/SAC
              </th>
              <th className="border border-gray-300 px-3 py-3 text-left text-xs font-semibold text-gray-700">Qty</th>
              <th className="border border-gray-300 px-3 py-3 text-left text-xs font-semibold text-gray-700">Rate</th>
              <th className="border border-gray-300 px-3 py-3 text-left text-xs font-semibold text-gray-700">
                Discount
              </th>
              <th className="border border-gray-300 px-3 py-3 text-left text-xs font-semibold text-gray-700">
                Taxable Value
              </th>
              <th className="border border-gray-300 px-3 py-3 text-left text-xs font-semibold text-gray-700">
                CGST Rate
              </th>
              <th className="border border-gray-300 px-3 py-3 text-left text-xs font-semibold text-gray-700">
                CGST Amt
              </th>
              <th className="border border-gray-300 px-3 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border border-gray-300 px-3 py-3 text-sm text-gray-700">{index + 1}</td>
                <td className="border border-gray-300 px-3 py-3 text-sm text-gray-700">
                  {invoiceData.itemDetails[index]?.title || item.title}
                </td>
                <td className="border border-gray-300 px-3 py-3 text-sm text-gray-700">{item.hsnSac || "N/A"}</td>
                <td className="border border-gray-300 px-3 py-3 text-sm text-gray-700">{item.quantity}</td>
                <td className="border border-gray-300 px-3 py-3 text-sm text-gray-700">{formatCurrency(item.rate)}</td>
                <td className="border border-gray-300 px-3 py-3 text-sm text-gray-700">
                  {formatCurrency(item.discount)}
                </td>
                <td className="border border-gray-300 px-3 py-3 text-sm text-gray-700">
                  {formatCurrency(item.taxableValue)}
                </td>
                <td className="border border-gray-300 px-3 py-3 text-sm text-gray-700">{item.gstRate}%</td>
                <td className="border border-gray-300 px-3 py-3 text-sm text-gray-700">
                  {formatCurrency(item.gstAmount)}
                </td>
                <td className="border border-gray-300 px-3 py-3 text-sm text-gray-700 font-semibold">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="font-semibold bg-gray-100">
            <tr>
              <td colSpan={9} className="border border-gray-300 text-gray-900 px-3 py-3 text-right">
                Sub Total
              </td>
              <td className="border border-gray-300 text-gray-900 px-3 py-3">{formatCurrency(invoiceData.subTotal)}</td>
            </tr>
            <tr>
              <td colSpan={9} className="border border-gray-300 text-gray-900 px-3 py-3 text-right">
                Total Discount
              </td>
              <td className="border border-gray-300 text-gray-900 px-3 py-3">
                {formatCurrency(invoiceData.totalDiscount)}
              </td>
            </tr>
            <tr>
              <td colSpan={9} className="border border-gray-300 text-gray-900 px-3 py-3 text-right">
                IGST
              </td>
              <td className="border border-gray-300 text-gray-900 px-3 py-3">{formatCurrency(invoiceData.gst)}</td>
            </tr>
            <tr>
              <td colSpan={9} className="border border-gray-300 text-gray-900 px-3 py-3 text-right">
                CESS
              </td>
              <td className="border border-gray-300 text-gray-900 px-3 py-3">{formatCurrency(invoiceData.cess)}</td>
            </tr>
            <tr className="font-bold text-lg bg-blue-50">
              <td colSpan={9} className="border border-gray-300 text-gray-900 px-3 py-3 text-right">
                Total Amount
              </td>
              <td className="border border-gray-300 text-gray-900 px-3 py-3">
                {formatCurrency(invoiceData.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer Section */}
      <div className="mt-8 space-y-6">
        {/* Amount in Words */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-gray-700 text-sm">
            <strong>Amount in Words:</strong>{" "}
            <span className="font-semibold text-blue-600">
              Rupees {convertNumberToWords(invoiceData.totalAmount)} Only
            </span>
          </p>
        </div>

        {/* Notes */}
        {invoiceData.notes && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Notes:</h4>
            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{invoiceData.notes}</p>
          </div>
        )}

        {/* Signature and Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Signature */}
          <div className="text-left">
            <p className="text-gray-800 font-semibold mb-4">For Shivam Electronics</p>
            <div className="border-b-2 border-gray-800 w-48 mb-2"></div>
            <p className="text-gray-700 text-sm">Authorised Signatory</p>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <p className="text-gray-800 font-semibold mb-2">Pay via UPI</p>
            {qrCodeUrl && <img src={qrCodeUrl || "/placeholder.svg"} alt="UPI QR Code" className="mx-auto w-32 h-32" />}
            <p className="text-xs text-gray-600 mt-2">Scan to pay</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <h5 className="font-semibold text-gray-800 mb-2">Payment Details:</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>UPI ID:</strong> {invoiceData.upiId || "contact@shivamelectronics.com"}
              </p>
              <p>
                <strong>Bank:</strong> State Bank of India
              </p>
              <p>
                <strong>Account No:</strong> 1234567890
              </p>
              <p>
                <strong>IFSC:</strong> SBIN0001234
              </p>
            </div>
            <div>
              <p>
                <strong>Terms & Conditions:</strong>
              </p>
              <ul className="text-xs mt-1 space-y-1">
                <li>• Payment due within 15 days of invoice date</li>
                <li>• Goods once sold will not be taken back</li>
                <li>• Warranty as per manufacturer terms</li>
                <li>• Subject to Gujarat jurisdiction</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Invoice Preview</h2>
            <div className="flex space-x-2">
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button onClick={downloadPDF} disabled={isGenerating} size="sm">
                <Download className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>
          <div className="p-4">
            <InvoiceContent />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-4 no-print">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
        <Button onClick={downloadPDF} disabled={isGenerating}>
          <Download className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating PDF..." : "Download PDF"}
        </Button>
      </div>
      <InvoiceContent />
    </div>
  )
}
