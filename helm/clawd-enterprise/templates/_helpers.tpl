{{/*
Expand the name of the chart.
*/}}
{{- define "clawd-enterprise.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "clawd-enterprise.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "clawd-enterprise.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "clawd-enterprise.labels" -}}
helm.sh/chart: {{ include "clawd-enterprise.chart" . }}
{{ include "clawd-enterprise.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "clawd-enterprise.selectorLabels" -}}
app.kubernetes.io/name: {{ include "clawd-enterprise.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Gateway labels
*/}}
{{- define "clawd-enterprise.gateway.labels" -}}
{{ include "clawd-enterprise.labels" . }}
app.kubernetes.io/component: gateway
{{- end }}

{{/*
Gateway selector labels
*/}}
{{- define "clawd-enterprise.gateway.selectorLabels" -}}
{{ include "clawd-enterprise.selectorLabels" . }}
app.kubernetes.io/component: gateway
{{- end }}

{{/*
Dashboard labels
*/}}
{{- define "clawd-enterprise.dashboard.labels" -}}
{{ include "clawd-enterprise.labels" . }}
app.kubernetes.io/component: dashboard
{{- end }}

{{/*
Dashboard selector labels
*/}}
{{- define "clawd-enterprise.dashboard.selectorLabels" -}}
{{ include "clawd-enterprise.selectorLabels" . }}
app.kubernetes.io/component: dashboard
{{- end }}

{{/*
Postgres labels
*/}}
{{- define "clawd-enterprise.postgres.labels" -}}
{{ include "clawd-enterprise.labels" . }}
app.kubernetes.io/component: postgres
{{- end }}

{{/*
Postgres selector labels
*/}}
{{- define "clawd-enterprise.postgres.selectorLabels" -}}
{{ include "clawd-enterprise.selectorLabels" . }}
app.kubernetes.io/component: postgres
{{- end }}

{{/*
Database URL
*/}}
{{- define "clawd-enterprise.databaseUrl" -}}
postgresql://{{ .Values.postgres.username }}:{{ .Values.postgres.password }}@{{ include "clawd-enterprise.fullname" . }}-postgres:{{ .Values.postgres.port }}/{{ .Values.postgres.database }}
{{- end }}
