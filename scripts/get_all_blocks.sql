-- get blocks with all joins
SELECT
    blk.id,
    blk.scenario,
    blk."title" as "block_name",
    sd."numDaysInInterval",
    sjp."seedPaymentId",
    pmt.amount,
    tal.title as "tally title",
    tpmt.amount
    -- pmt.*
    
FROM public."blocks" blk
LEFT JOIN public."seedDatas" sd ON blk."id" = sd."blockId"
LEFT JOIN public."tallys" tal ON blk."id" = tal."blockId"
LEFT JOIN public."tallyPayments" tpmt ON tpmt.id = tal."tallyPaymentId"

LEFT JOIN public."seedDataJoinPayments" sjp ON sd.id = sjp."seedDataId"
LEFT JOIN public."seedPayments" pmt ON pmt.id = sjp."seedPaymentId"

order by blk.id ASC