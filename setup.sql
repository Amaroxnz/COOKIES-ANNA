-- Rode este arquivo inteiro no Supabase: SQL Editor > New query > Run
create table products(
  id uuid primary key default gen_random_uuid(),
  name text not null, description text default '', price numeric(8,2) not null,
  emoji text default '🍪', photo_url text, stock int not null default 0,
  active boolean not null default true, sort int not null default 0);
create table reviews(
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  name text not null check (char_length(name) between 1 and 60),
  rating int not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 1 and 500),
  approved boolean not null default false,
  created_at timestamptz default now());
alter table products enable row level security;
alter table reviews enable row level security;
-- público: vê produtos ativos e avaliações aprovadas; envia avaliação (sempre pendente)
create policy "ver produtos" on products for select using (active);
create policy "ver avaliacoes" on reviews for select using (approved);
create policy "enviar avaliacao" on reviews for insert to anon with check (approved = false);
-- dona (usuário logado): controle total
create policy "admin produtos" on products for all to authenticated using (true) with check (true);
create policy "admin avaliacoes" on reviews for all to authenticated using (true) with check (true);
-- fotos
insert into storage.buckets(id,name,public) values('produtos','produtos',true) on conflict do nothing;
create policy "fotos publicas" on storage.objects for select using (bucket_id='produtos');
create policy "admin fotos" on storage.objects for all to authenticated using (bucket_id='produtos') with check (bucket_id='produtos');
-- cardápio inicial
insert into products(name,description,price,emoji,stock,sort) values
('Nutella','Massa de baunilha com recheio de Nutella.',13,'🍫',20,1),
('Oreo','Massa black com recheio de Oreo, Nutella e brigadeiro de leite ninho.',12,'⚫',20,2),
('Kinder Bueno','Massa de baunilha com recheio de Kinder.',13,'🥛',20,3),
('Red Velvet','Massa de red velvet com recheio de brigadeiro de leite ninho.',12,'❤️',20,4),
('Pistache','Massa de baunilha com pedaços de pistache recheado de creme de pistache.',12,'🟢',20,5),
('Brookie','Nutella + cookie + brownie.',20,'🍰',20,6);
