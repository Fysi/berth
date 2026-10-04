# Multi-stage Dockerfile compiling Git 2.56.0 on cloudflare/debian-trixie
FROM cloudflare/debian-trixie AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    ca-certificates \
    libssl-dev \
    zlib1g-dev \
    libcurl4-openssl-dev \
    libexpat1-dev \
    gettext \
    && rm -rf /var/lib/apt/lists/*

# Download and compile Git 2.56.0
WORKDIR /tmp
RUN curl -fsSL https://mirrors.edge.kernel.org/pub/software/scm/git/git-2.56.0.tar.gz -o git.tar.gz || \
    curl -fsSL https://github.com/git/git/archive/refs/tags/v2.56.0.tar.gz -o git.tar.gz \
    && tar -xzf git.tar.gz \
    && cd git-* \
    && make prefix=/usr/local NO_TCLTK=1 -j$(nproc) all \
    && make prefix=/usr/local NO_TCLTK=1 install

# Final runtime image
FROM cloudflare/debian-trixie

# Install runtime dependencies and trust Cloudflare Containers CA
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    openssh-client \
    libcurl4 \
    libexpat1 \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled Git 2.56 binaries from builder
COPY --from=builder /usr/local /usr/local

# Configure Git default identities and signing
RUN git config --system init.defaultBranch main \
    && git config --system core.packedGitLimit 128m \
    && git config --system core.packedGitWindowSize 128m

# Verification check on build
RUN git --version

ENTRYPOINT ["sleep", "infinity"]
