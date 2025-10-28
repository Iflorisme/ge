class LinkvertiseSolver {
    constructor() {
        this.linkInput = document.getElementById('linkInput');
        this.clearBtn = document.getElementById('clearBtn');
        this.solveBtn = document.getElementById('solveBtn');
        this.resultSection = document.getElementById('resultSection');
        this.errorSection = document.getElementById('errorSection');
        this.resultContent = document.getElementById('resultContent');
        this.errorContent = document.getElementById('errorContent');
        this.copyBtn = document.getElementById('copyBtn');
        this.extractedUrl = null;

        this.init();
    }

    init() {
        this.solveBtn.addEventListener('click', () => this.handleSolve());
        this.clearBtn.addEventListener('click', () => this.handleClear());
        this.copyBtn.addEventListener('click', () => this.handleCopy());
        this.linkInput.addEventListener('input', () => this.resetFeedback());
        this.linkInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.handleSolve();
            }
        });
    }

    resetFeedback() {
        this.hideError();
        this.hideResult();
    }

    handleClear() {
        this.linkInput.value = '';
        this.linkInput.focus();
        this.resetFeedback();
    }

    async handleSolve() {
        const url = this.linkInput.value.trim();

        if (!url) {
            this.showError('Please enter a URL to solve.');
            return;
        }

        this.resetFeedback();
        this.setLoading(true);

        try {
            const result = await this.solveLink(url);

            if (result.success) {
                this.extractedUrl = result.url;
                this.showResult(result.url, result.method);
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            console.error(error);
            this.showError('We ran into an unexpected problem while processing that link. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    async solveLink(url) {
        if (!this.isValidUrl(url)) {
            return {
                success: false,
                error: 'That doesn\'t look like a valid URL. Double-check and try again.'
            };
        }

        if (!this.isLinkvertiseUrl(url)) {
            return {
                success: false,
                error: 'This URL is not recognised as a Linkvertise link. Make sure you pasted the full Linkvertise URL.'
            };
        }

        const strategies = [
            async () => {
                const candidate = this.extractFromQuery(url);
                return candidate ? { url: candidate, method: 'Query parameter extraction' } : null;
            },
            async () => {
                const candidate = this.decodeFromPath(url);
                return candidate ? { url: candidate, method: 'Encoded path detection' } : null;
            },
            async () => {
                const candidate = await this.fetchViaLinkvertiseApi(url);
                return candidate ? { ...candidate } : null;
            },
            async () => {
                const candidate = await this.fetchViaFallbackServices(url);
                return candidate ? { ...candidate } : null;
            }
        ];

        for (const strategy of strategies) {
            try {
                const result = await strategy();
                if (result) {
                    return { success: true, ...result };
                }
            } catch (error) {
                console.warn('Link extraction strategy failed:', error);
                continue;
            }
        }

        return {
            success: false,
            error: 'We could not automatically extract the destination from this link. It may require completing Linkvertise steps manually.'
        };
    }

    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (error) {
            return false;
        }
    }

    isLinkvertiseUrl(urlString) {
        try {
            const { hostname } = new URL(urlString);
            const host = hostname.toLowerCase();
            const supportedDomains = [
                'linkvertise.com',
                'linkvertise.net',
                'link-to.net',
                'up-to-down.net',
                'direct-link.net',
                'link-center.net',
                'file-link.net'
            ];

            return supportedDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
        } catch (error) {
            return false;
        }
    }

    extractFromQuery(urlString) {
        try {
            const url = new URL(urlString);
            const params = url.searchParams;

            const keys = ['target', 'url', 'r', 'redirect', 'go', 'out'];
            for (const key of keys) {
                const value = params.get(key);
                if (!value) continue;

                const decoded = this.deepDecode(value.trim());
                if (decoded && this.isValidUrl(decoded) && !this.isLinkvertiseUrl(decoded)) {
                    return decoded;
                }
            }

            if (url.hash) {
                const match = url.hash.match(/[?&](target|url|redirect|r|go)=([^&#]+)/i);
                if (match && match[2]) {
                    const decoded = this.deepDecode(match[2]);
                    if (decoded && this.isValidUrl(decoded) && !this.isLinkvertiseUrl(decoded)) {
                        return decoded;
                    }
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    decodeFromPath(urlString) {
        try {
            const url = new URL(urlString);
            const segments = url.pathname.split('/').filter(Boolean);

            for (let i = segments.length - 1; i >= 0; i -= 1) {
                const segment = segments[i];
                if (segment.length < 6) continue;

                const decoded = this.tryMultipleDecodings(segment);
                if (decoded && this.isValidUrl(decoded) && !this.isLinkvertiseUrl(decoded)) {
                    return decoded;
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    deepDecode(value) {
        try {
            let decoded = decodeURIComponent(value);
            let previous = null;

            while (decoded !== previous) {
                previous = decoded;
                decoded = decodeURIComponent(decoded);
            }

            return decoded;
        } catch (error) {
            return value;
        }
    }

    tryMultipleDecodings(value) {
        const methods = [
            (str) => this.deepDecode(str),
            (str) => atob(str.replace(/-/g, '+').replace(/_/g, '/')),
            (str) => {
                try {
                    return atob(str);
                } catch (error) {
                    return null;
                }
            },
            (str) => {
                if (!/^([0-9a-f]{2})+$/i.test(str)) return null;
                const bytes = str.match(/.{1,2}/g);
                if (!bytes) return null;
                return bytes.map((byte) => String.fromCharCode(parseInt(byte, 16))).join('');
            }
        ];

        for (const method of methods) {
            try {
                const decoded = method(value);
                if (decoded && decoded.length > 6) {
                    const cleaned = decoded.trim();
                    if (this.isValidUrl(cleaned) && !this.isLinkvertiseUrl(cleaned)) {
                        return cleaned;
                    }
                }
            } catch (error) {
                continue;
            }
        }

        return null;
    }

    extractLinkMetadata(urlString) {
        try {
            const url = new URL(urlString);
            const segments = url.pathname.split('/').filter(Boolean);
            if (!segments.length) return null;

            const idSegment = segments.find((part) => /^\d+$/.test(part));
            if (!idSegment) return null;

            return {
                id: idSegment,
                host: url.hostname.toLowerCase()
            };
        } catch (error) {
            return null;
        }
    }

    async fetchViaLinkvertiseApi(urlString) {
        const metadata = this.extractLinkMetadata(urlString);
        if (!metadata?.id) {
            return null;
        }

        const staticEndpoints = [
            'https://api.linkvertise.com/api/v1/redirect/link/static/',
            'https://publisher.linkvertise.com/api/v1/redirect/link/static/',
            'https://linkvertise.com/api/v1/redirect/link/static/',
            'https://api.codex.lnks.co/api/v1/redirect/link/static/'
        ];

        for (const base of staticEndpoints) {
            const endpoint = `${base}${metadata.id}`;
            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        accept: 'application/json',
                        'x-requested-with': 'XMLHttpRequest'
                    }
                });

                if (!response.ok) {
                    continue;
                }

                const payload = await response.json();
                const target = this.extractTargetFromPayload(payload);
                if (target) {
                    return {
                        url: target,
                        method: `Linkvertise API (${this.safeHostname(endpoint)})`
                    };
                }
            } catch (error) {
                console.warn('Static Linkvertise API failed:', error);
                continue;
            }
        }

        return null;
    }

    extractTargetFromPayload(payload) {
        if (!payload) return null;

        const directCandidates = [
            payload?.data?.target,
            payload?.data?.link?.target,
            payload?.data?.link?.target_url,
            payload?.data?.link?.targetUrl,
            payload?.data?.link?.link,
            payload?.data?.link?.url,
            payload?.data?.link?.destination,
            payload?.data?.link?.destination_url
        ];

        for (const candidate of directCandidates) {
            if (typeof candidate !== 'string') continue;
            const cleaned = candidate.trim();
            if (this.isValidUrl(cleaned) && !this.isLinkvertiseUrl(cleaned)) {
                return cleaned;
            }
        }

        const discovered = this.collectUrls(payload);
        for (const candidate of discovered) {
            const cleaned = candidate.trim();
            if (this.isValidUrl(cleaned) && !this.isLinkvertiseUrl(cleaned)) {
                return cleaned;
            }
        }

        return null;
    }

    collectUrls(source, accumulator = new Set()) {
        if (!source) {
            return accumulator;
        }

        if (typeof source === 'string') {
            const matches = source.match(/https?:\/\/[^\s"'<>]+/gi);
            if (matches) {
                matches.forEach((match) => {
                    const cleaned = match.replace(/[),.;]+$/, '');
                    accumulator.add(cleaned);
                });
            }
            return accumulator;
        }

        if (Array.isArray(source)) {
            source.forEach((item) => this.collectUrls(item, accumulator));
            return accumulator;
        }

        if (typeof source === 'object') {
            Object.values(source).forEach((value) => this.collectUrls(value, accumulator));
            return accumulator;
        }

        return accumulator;
    }

    async fetchViaFallbackServices(urlString) {
        const endpoints = [
            {
                url: `https://bypass.bot.nu/api/direct?url=${encodeURIComponent(urlString)}`,
                parser: (data) => data?.destination || data?.target || data?.url,
                label: 'bypass.bot.nu API'
            },
            {
                url: `https://bypass.pm/bypass?url=${encodeURIComponent(urlString)}`,
                parser: (data) => data?.destination || data?.url,
                label: 'bypass.pm API'
            },
            {
                url: `https://api.bypass.city/bypass?url=${encodeURIComponent(urlString)}`,
                parser: (data) => data?.destination || data?.result,
                label: 'bypass.city API'
            }
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint.url, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        accept: 'application/json'
                    }
                });

                if (!response.ok) {
                    continue;
                }

                const payload = await response.json();
                const destination = endpoint.parser(payload);

                if (typeof destination === 'string') {
                    const cleaned = destination.trim();
                    if (this.isValidUrl(cleaned) && !this.isLinkvertiseUrl(cleaned)) {
                        return {
                            url: cleaned,
                            method: `External service (${endpoint.label})`
                        };
                    }
                }
            } catch (error) {
                console.warn('Fallback API failed:', endpoint.url, error);
                continue;
            }
        }

        return null;
    }

    safeHostname(url) {
        try {
            return new URL(url).hostname;
        } catch (error) {
            return url;
        }
    }

    setLoading(loading) {
        if (loading) {
            this.solveBtn.classList.add('loading');
            this.solveBtn.disabled = true;
        } else {
            this.solveBtn.classList.remove('loading');
            this.solveBtn.disabled = false;
        }
    }

    showResult(url, method) {
        this.resultContent.innerHTML = `
            <div style="margin-bottom: 0.75rem;">
                <strong>Extracted URL:</strong>
            </div>
            <div style="margin-bottom: 0.75rem;">
                <a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(url)}</a>
            </div>
            <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.6);">
                Method: ${this.escapeHtml(method)}
            </div>
        `;
        this.resultSection.classList.remove('hidden');
    }

    showError(message) {
        this.errorContent.textContent = message;
        this.errorSection.classList.remove('hidden');
    }

    hideResult() {
        this.resultSection.classList.add('hidden');
    }

    hideError() {
        this.errorSection.classList.add('hidden');
    }

    async handleCopy() {
        if (!this.extractedUrl) {
            return;
        }

        try {
            await navigator.clipboard.writeText(this.extractedUrl);
            this.showToast('Copied to clipboard!');
        } catch (error) {
            const textArea = document.createElement('textarea');
            textArea.value = this.extractedUrl;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                this.showToast('Copied to clipboard!');
            } catch (fallbackError) {
                this.showToast('Copy failed. Please copy the link manually.');
            }

            document.body.removeChild(textArea);
        }
    }

    showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) {
            existing.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 2400);
    }

    escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LinkvertiseSolver();
});
