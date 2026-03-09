import puppeteer from 'puppeteer';

export async function generatePDF(html: string, options?: { noMargins?: boolean }): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const margin = options?.noMargins
    ? { top: '0', bottom: '0', left: '0', right: '0' }
    : { top: '22mm', bottom: '18mm', left: '20mm', right: '20mm' };

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      margin,
      printBackground: true,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
