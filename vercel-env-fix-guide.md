# Vercel DATABASE_URL ���������޸�ָ��

## ��������
```
Error [PrismaClientInitializationError]: 
Invalid `prisma.influencer.findMany()` invocation:

error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
  -->  schema.prisma:7
   | 
 6 |   provider = "postgresql"
 7 |   url      = env("DATABASE_URL")
```

## �������

### 1. ���ʵ���API
������ɺ󣬷��ʣ�`https://�������.vercel.app/api/debug-env`

���API����ʾ��
- ���������Ƿ����
- ʵ�ʵ�ֵ�ͳ���
- �Ƿ�������Ż�ո�
- �Ƿ�����ȷ��Э�鿪ͷ

### 2. ��Vercel Dashboard���޸���������

1. ��¼ [Vercel Dashboard](https://vercel.com/dashboard)
2. �ҵ�������Ŀ���������
3. ��� **Settings**  **Environment Variables**
4. **ɾ���������е� DATABASE_URL ����**
5. ��� **"Add New"** ����±�����

```
Name: DATABASE_URL
Value: postgresql://postgres:rR9tYMTfwaG0LGbH@db.efzpntcevdiwkaqubrxq.supabase.co:5432/postgres
Environment: Production, Preview, Development (ȫѡ)
```

 **��Ҫ**��ȷ��û��˫���Ű�Χ����URL��

### 3. ���²���
���û��������󣬱������²���
- �� Deployments ҳ���� **"Redeploy"**
- ��������һ���µ� commit ��������

### 4. ��֤�޸�
������ɺ�
1. ���� `/api/debug-env` �鿴��������״̬
2. ���� `/api/influencers` �������ݿ�����
3. ��� Vercel Functions ��־ȷ���޴���

## ��������

### Q: Ϊʲô����������Vercel����
A: ����ʹ�� .env.local��Vercelʹ��Dashboard���õĻ������������߿��ܲ�ͬ

### Q: ���û����������Ǳ���
A: �������²��������Ч�����û������������Զ���������

### Q: URL��ʽ��ȷ�����Ǳ���
A: ����Ƿ��������ַ���BOM��ȷ��ʹ��UTF-8����

### Q: ���ȷ���޸��ɹ���
A: ���� `/api/debug-env` �鿴 `startsWithPostgresql: true` ���޴�����־
