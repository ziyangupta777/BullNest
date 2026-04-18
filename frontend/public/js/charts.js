// =============================================
// CHARTS.JS — Chart.js wrappers
// =============================================

const Charts = {
  instances: {},

  destroy(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  genSparkData(len, base, up) {
    const d = []; let v = base;
    for (let i = 0; i < len; i++) {
      v += (Math.random() - (up ? 0.44 : 0.56)) * base * 0.012;
      d.push(parseFloat(v.toFixed(2)));
    }
    return d;
  },

  genCandleData(count, base) {
    const data = [];
    let curr = base;
    const now = luxon.DateTime.now();
    for (let i = 0; i < count; i++) {
      const volatility = base * 0.008;
      const open = curr + (Math.random() - 0.5) * volatility;
      const close = open + (Math.random() - 0.48) * volatility * 1.5;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      data.push({
        x: now.minus({ minutes: (count - i) * 15 }).toMillis(),
        o: parseFloat(open.toFixed(2)),
        h: parseFloat(high.toFixed(2)),
        l: parseFloat(low.toFixed(2)),
        c: parseFloat(close.toFixed(2))
      });
      curr = close;
    }
    return data;
  },

  // Hero chart (Nifty 50 Candlestick)
  hero(canvasId) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const data = this.genCandleData(20, 22000);
    const allVals = data.flatMap(d => [d.o, d.h, d.l, d.c]);
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    const padding = (maxVal - minVal) * 0.1;

    this.instances[canvasId] = new Chart(ctx, {
      type: 'candlestick',
      data: {
        datasets: [{
          label: 'NIFTY 50',
          data: data,
          color: {
            up: '#00C896',
            down: '#FF4757',
            unchanged: '#6B7280',
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 10, bottom: 10 } },
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false, type: 'timeseries' },
          y: { 
            display: false,
            min: minVal - padding,
            max: maxVal + padding
          }
        }
      }
    });
  },

  // Mini sparkline inside market cards
  mini(canvasId, price, up) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const data = this.genSparkData(20, price, up);
    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array(20).fill(''),
        datasets: [{
          data,
          borderColor: up ? '#00C896' : '#FF4757',
          borderWidth: 1.5,
          fill: true,
          backgroundColor: up ? 'rgba(0,200,150,.07)' : 'rgba(255,71,87,.07)',
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } },
        animation: false
      }
    });
  },

  // Main stock/crypto detail chart
  main(canvasId, prices, labels, up) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels || Array(prices.length).fill(''),
        datasets: [{
          label: 'Price',
          data: prices,
          borderColor: up ? '#00E5A0' : '#FF4757',
          borderWidth: 2,
          fill: true,
          backgroundColor: (c) => {
            const g = c.chart.ctx.createLinearGradient(0, 0, 0, 240);
            g.addColorStop(0, up ? 'rgba(0,229,160,.12)' : 'rgba(255,71,87,.12)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            return g;
          },
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: up ? '#00E5A0' : '#FF4757'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1A1F30',
            titleColor: '#6B7280',
            bodyColor: '#E8EAF0',
            borderColor: '#252A3A',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => `₹${Number(ctx.parsed.y).toLocaleString('en-IN')}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,.04)' },
            ticks: { color: '#6B7280', font: { size: 10 }, maxTicksLimit: 8 }
          },
          y: {
            position: 'right',
            grid: { color: 'rgba(255,255,255,.04)' },
            ticks: {
              color: '#6B7280',
              font: { size: 10 },
              callback: v => `₹${Number(v).toLocaleString('en-IN')}`
            }
          }
        }
      }
    });
    return this.instances[canvasId];
  },

  // Portfolio donut
  donut(canvasId, labels, data, colors) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1A1F30',
            bodyColor: '#E8EAF0',
            borderColor: '#252A3A',
            borderWidth: 1,
            callbacks: {
              label: ctx => ` ${ctx.label}: ₹${Number(ctx.parsed).toLocaleString('en-IN')}`
            }
          }
        }
      }
    });
  },

  // Add live price point to existing main chart
  appendPrice(canvasId, price, label) {
    const chart = this.instances[canvasId];
    if (!chart) return;
    const ds = chart.data.datasets[0];
    ds.data.push(price);
    chart.data.labels.push(label || '');
    if (ds.data.length > 60) {
      ds.data.shift();
      chart.data.labels.shift();
    }
    chart.update('none');
  }
};
