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
                const candidate = this.extractFromFragment(url);
                return candidate ? { url: candidate, method: 'Fragment/hash extraction' } : null;
            },
            async () => {
                const candidate = this.decodeFromPath(url);
                return candidate ? { url: candidate, method: 'Encoded path detection' } : null;
            },
            async () => {
                const candidate = this.extractDynamicLink(url);
                return candidate ? { url: candidate, method: 'Dynamic link reconstruction' } : null;
            },
            async () => {
                const candidate = await this.fetchViaLinkvertiseApi(url);
                return candidate ? { ...candidate } : null;
            },
            async () => {
                const candidate = await this.fetchPageAndExtract(url);
                return candidate ? { ...candidate } : null;
            },
            async () => {
                const candidate = await this.fetchViaProxyServices(url);
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
            error: 'Could not automatically extract the destination. This link may require manual steps like waiting, captcha, or ad interaction.'
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
                'linkvertise.download',
                'link-to.net',
                'up-to-down.net',
                'direct-link.net',
                'link-center.net',
                'file-link.net',
                'url-to.net',
                'link4m.co',
                'linkfly.me'
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

            const keys = ['target', 'url', 'r', 'redirect', 'go', 'out', 'link', 'destination', 'to', 'u'];
            for (const key of keys) {
                const value = params.get(key);
                if (!value) continue;

                const decoded = this.deepDecode(value.trim());
                if (decoded && this.isValidUrl(decoded) && !this.isLinkvertiseUrl(decoded)) {
                    return decoded;
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    extractFromFragment(urlString) {
        try {
            const url = new URL(urlString);
            if (!url.hash) return null;

            const hash = url.hash.substring(1);

            const match = hash.match(/[?&]?(target|url|redirect|r|go|link|destination|to|u)=([^&#]+)/i);
            if (match && match[2]) {
                const decoded = this.deepDecode(match[2]);
                if (decoded && this.isValidUrl(decoded) && !this.isLinkvertiseUrl(decoded)) {
                    return decoded;
                }
            }

            if (this.isValidUrl(hash) && !this.isLinkvertiseUrl(hash)) {
                return hash;
            }

            const decoded = this.tryMultipleDecodings(hash);
            if (decoded && this.isValidUrl(decoded) && !this.isLinkvertiseUrl(decoded)) {
                return decoded;
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

            if (segments.length >= 3) {
                const possibleEncoded = segments.slice(-2).join('');
                const decoded = this.tryMultipleDecodings(possibleEncoded);
                if (decoded && this.isValidUrl(decoded) && !this.isLinkvertiseUrl(decoded)) {
                    return decoded;
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    extractDynamicLink(urlString) {
        try {
            const url = new URL(urlString);
            const segments = url.pathname.split('/').filter(Boolean);

            const dynamicPattern = /^(?:dynamic|d)$/i;
            const dynamicIndex = segments.findIndex(seg => dynamicPattern.test(seg));

            if (dynamicIndex !== -1 && segments.length > dynamicIndex + 1) {
                const potentialUrl = segments.slice(dynamicIndex + 1).join('/');
                const decoded = this.deepDecode(potentialUrl);

                if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
                    if (this.isValidUrl(decoded) && !this.isLinkvertiseUrl(decoded)) {
                        return decoded;
                    }
                } else {
                    const withProtocol = 'https://' + decoded;
                    if (this.isValidUrl(withProtocol) && !this.isLinkvertiseUrl(withProtocol)) {
                        return withProtocol;
                    }
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
            let iterations = 0;

            while (decoded !== previous && iterations < 10) {
                previous = decoded;
                try {
                    decoded = decodeURIComponent(decoded);
                } catch {
                    break;
                }
                iterations++;
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
            },
            (str) => {
                try {
                    return decodeURIComponent(str.replace(/\+/g, ' '));
                } catch {
                    return null;
                }
            },
            (str) => {
                const rot13 = (s) => s.replace(/[a-zA-Z]/g, (c) => {
                    return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
                });
                return rot13(str);
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
            
            let slug = null;
            if (segments.length >= 2) {
                slug = segments[segments.length - 1];
            }

            return {
                id: idSegment,
                slug: slug,
                segments: segments,
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
            `https://api.linkvertise.com/api/v1/redirect/link/static/${metadata.id}`,
            `https://publisher.linkvertise.com/api/v1/redirect/link/static/${metadata.id}`,
            `https://linkvertise.com/api/v1/redirect/link/static/${metadata.id}`,
            `https://api.codex.lnks.co/api/v1/redirect/link/static/${metadata.id}`
        ];

        const dynamicEndpoints = metadata.slug ? [
            `https://api.linkvertise.com/api/v1/redirect/link/${metadata.id}/${metadata.slug}`,
            `https://publisher.linkvertise.com/api/v1/redirect/link/${metadata.id}/${metadata.slug}`
        ] : [];

        const allEndpoints = [...staticEndpoints, ...dynamicEndpoints];

        for (const endpoint of allEndpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'accept': 'application/json',
                        'accept-language': 'en-US,en;q=0.9',
                        'x-requested-with': 'XMLHttpRequest',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
                console.warn('Linkvertise API failed:', endpoint, error);
                continue;
            }
        }

        return null;
    }

    extractTargetFromPayload(payload) {
        if (!payload) return null;

        const directCandidates = [
            payload?.data?.target,
            payload?.data?.target_url,
            payload?.data?.link?.target,
            payload?.data?.link?.target_url,
            payload?.data?.link?.targetUrl,
            payload?.data?.link?.link,
            payload?.data?.link?.url,
            payload?.data?.link?.destination,
            payload?.data?.link?.destination_url,
            payload?.target,
            payload?.target_url,
            payload?.destination,
            payload?.url
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

    async fetchPageAndExtract(urlString) {
        try {
            const corsProxies = [
                'https://api.allorigins.win/raw?url=',
                'https://corsproxy.io/?',
                'https://api.codetabs.com/v1/proxy?quest='
            ];

            for (const proxy of corsProxies) {
                try {
                    const response = await fetch(proxy + encodeURIComponent(urlString), {
                        method: 'GET',
                        headers: {
                            'accept': 'text/html,application/xhtml+xml'
                        }
                    });

                    if (!response.ok) continue;

                    const html = await response.text();
                    const extracted = this.extractFromHtml(html);
                    
                    if (extracted) {
                        return {
                            url: extracted,
                            method: 'HTML page analysis'
                        };
                    }
                } catch (error) {
                    console.warn('CORS proxy failed:', proxy, error);
                    continue;
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    extractFromHtml(html) {
        const patterns = [
            /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i,
            /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i,
            /window\.location\.href\s*=\s*["']([^"']+)["']/i,
            /window\.location\s*=\s*["']([^"']+)["']/i,
            /<a[^>]+href=["']([^"']+)["'][^>]*>(?:Continue|Skip|Proceed|Go to destination|Click here)/i,
            /data-target=["']([^"']+)["']/i,
            /data-url=["']([^"']+)["']/i,
            /data-destination=["']([^"']+)["']/i,
            /"target"\s*:\s*"([^"]+)"/i,
            /"target_url"\s*:\s*"([^"]+)"/i,
            /"destination"\s*:\s*"([^"]+)"/i
        ];

        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
                const candidate = this.deepDecode(match[1].trim());
                if (this.isValidUrl(candidate) && !this.isLinkvertiseUrl(candidate)) {
                    return candidate;
                }
            }
        }

        const urlMatches = html.match(/https?:\/\/[^\s"'<>]+/gi);
        if (urlMatches) {
            const validUrls = urlMatches
                .map(url => url.replace(/[),.;]+$/, '').trim())
                .filter(url => this.isValidUrl(url) && !this.isLinkvertiseUrl(url));

            const scoredUrls = validUrls.map(url => {
                let score = 0;
                if (url.includes('download')) score += 3;
                if (url.includes('file')) score += 2;
                if (url.includes('cdn')) score += 2;
                if (url.includes('drive.google.com')) score += 5;
                if (url.includes('mega.nz')) score += 5;
                if (url.includes('mediafire.com')) score += 5;
                if (url.includes('dropbox.com')) score += 5;
                if (url.includes('.zip') || url.includes('.rar') || url.includes('.7z')) score += 4;
                if (url.includes('.exe') || url.includes('.apk') || url.includes('.dmg')) score += 4;
                return { url, score };
            });

            scoredUrls.sort((a, b) => b.score - a.score);

            if (scoredUrls.length > 0 && scoredUrls[0].score > 0) {
                return scoredUrls[0].url;
            }

            if (validUrls.length > 0) {
                return validUrls[0];
            }
        }

        return null;
    }

    async fetchViaProxyServices(urlString) {
        const endpoints = [
            {
                url: `https://api.bypass.vip/?url=${encodeURIComponent(urlString)}`,
                parser: (data) => data?.destination || data?.result?.url || data?.url,
                label: 'bypass.vip'
            },
            {
                url: `https://thebypasser.com/api?url=${encodeURIComponent(urlString)}`,
                parser: (data) => data?.destination || data?.bypassed || data?.url,
                label: 'thebypasser.com'
            }
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint.url, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'accept': 'application/json',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
                            method: `Bypass service (${endpoint.label})`
                        };
                    }
                }
            } catch (error) {
                console.warn('Proxy service failed:', endpoint.url, error);
                continue;
            }
        }

        return null;
    }

    async fetchViaFallbackServices(urlString) {
        const endpoints = [
            {
                url: `https://bypass.bot.nu/bypass2?url=${encodeURIComponent(urlString)}`,
                parser: (data) => data?.destination || data?.result || data?.bypassed_url || data?.target || data?.url,
                label: 'bypass.bot.nu'
            },
            {
                url: `https://api.bypass.city/bypass?url=${encodeURIComponent(urlString)}`,
                parser: (data) => data?.destination || data?.result || data?.url,
                label: 'bypass.city'
            }
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint.url, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'accept': 'application/json',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
                            method: `Fallback service (${endpoint.label})`
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
